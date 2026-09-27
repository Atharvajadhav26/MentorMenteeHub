const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const socket = require('../socket');

const getMenteeId = async (userId) => {
  const mentee = await prisma.mentee.findUnique({ where: { userId } });
  if (!mentee) throw new Error("Mentee profile not found for this user context");
  return mentee.id;
};

// 1. Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    
    const form = await prisma.mentorshipForm.findUnique({ where: { menteeId }});
    const profileComplete = form && form.formData && Object.keys(form.formData).length > 0;

    const progress = await prisma.progressRecord.findFirst({ 
      where: { menteeId }, 
      orderBy: { createdAt: 'desc' }
    });
    const latestCgpa = progress ? progress.cgpa : 0;

    const mentee = await prisma.mentee.findUnique({ where: { id: menteeId }});
    let upcomingMeetings = 0;
    if (mentee.mentorId) {
      upcomingMeetings = await prisma.meetingSchedule.count({ 
        where: { mentorId: mentee.mentorId, date: { gte: new Date() } }
      });
    }

    const unreadNotifications = await prisma.notification.count({
      where: { menteeId, isRead: false }
    });

    const { batchName, startDate, endDate } = mentee;

    res.json({ success: true, data: { profileComplete, latestCgpa, upcomingMeetings, unreadNotifications, batchName, startDate, endDate }});
  } catch(e) { next(e); }
};

// 2. Profile
exports.getProfile = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const profile = await prisma.mentee.findUnique({ 
      where: { id: menteeId },
      include: { mentor: true, mentorshipForm: true }
    });
    res.json({ success: true, data: profile });
  } catch(e) { next(e); }
};

// 3. Mentorship Form
exports.getMentorshipForm = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const form = await prisma.mentorshipForm.findUnique({ where: { menteeId } });
    if (!form) return res.status(404).json({ success: false, message: 'Mentorship matrix not yet unlocked by Mentor' });
    res.json({ success: true, data: form });
  } catch(e) { next(e); }
};

exports.fillMentorshipForm = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const { formData, photoBase64 } = req.body;
    
    let photoUrl = formData?.photoUrl || null;
    
    if (photoBase64) {
      const uploadRes = await cloudinary.uploader.upload(photoBase64, { folder: 'mentees' });
      photoUrl = uploadRes.secure_url;
    }

    const updatedData = { ...formData, photoUrl };

    const form = await prisma.mentorshipForm.update({
      where: { menteeId },
      data: {
        formData: updatedData,
        status: 'SUBMITTED' // FIXED From PENDING
      }
    });

    res.json({ success: true, data: form, message: 'Formal metrics successfully transmitted pending strict mentor approval.' });
  } catch(e) { 
    console.error(e);
    res.status(500).json({ success: false, message: 'Form transmission halted. Verify image string format or CDNs.' });
  }
};

// 4. Update Progress
exports.addProgress = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const { semester, academic_year, cgpa, attendance, backlogs, technicalSkills, communicationSkills, activities, certifications, internships, projects, selfRating } = req.body;

    const autoScore = (parseFloat(cgpa) * 4) + (parseFloat(attendance) * 0.3) + (parseInt(selfRating) * 3);

    const prog = await prisma.progressRecord.create({
      data: {
        menteeId, semester, academic_year, cgpa: parseFloat(cgpa), attendance: parseFloat(attendance),
        backlogs: parseInt(backlogs), technicalSkills, communicationSkills, activities, certifications,
        internships, projects, selfRating: parseInt(selfRating), autoScore
      }
    });
    res.json({ success: true, data: prog, message: 'Progress vector appended successfully.' });
  } catch(e) { next(e); }
};

exports.getProgress = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const records = await prisma.progressRecord.findMany({ where: { menteeId }, orderBy: { createdAt: 'asc' }});
    res.json({ success: true, data: records });
  } catch(e) { next(e); }
};

// 6 & 7. Messaging
exports.getMessages = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const mentee = await prisma.mentee.findUnique({ where: { id: menteeId }});

    if (!mentee.mentorId) return res.json({ success: true, data: [] });

    // Enforce strictly where menteeId AND mentorId match so there is no leakage
    const msgs = await prisma.guidanceMessage.findMany({ 
      where: { menteeId, mentorId: mentee.mentorId },
      include: { mentor: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: msgs });
  } catch(e) { next(e); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const { content, academic_year } = req.body;

    const mentee = await prisma.mentee.findUnique({ 
      where: { id: menteeId },
      include: { mentor: { select: { userId: true } } }
    });
    if(!mentee.mentorId) return res.status(400).json({ success: false, message: 'Crucial Error: Disconnected from Mentor uplink.' });

    const msg = await prisma.guidanceMessage.create({
      data: {
        menteeId,
        mentorId: mentee.mentorId,
        content,
        academic_year: academic_year || mentee.academic_year,
        isFromMentor: false
      }
    });

    if(mentee.mentor?.userId) {
       socket.emitToUser(mentee.mentor.userId, 'new_message', msg);
    }

    res.json({ success: true, data: msg, message: 'Message payload dispatched directly to Mentor.' });
  } catch(e) { next(e); }
};

// 8. Meetings
exports.getMeetings = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const mentee = await prisma.mentee.findUnique({ where: { id: menteeId }});
    
    if(!mentee.mentorId) return res.json({ success: true, data: [] });

    const meetings = await prisma.meetingSchedule.findMany({
      where: { mentorId: mentee.mentorId },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: meetings });
  } catch(e) { next(e); }
};

// 9. Notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const notifs = await prisma.notification.findMany({
      where: { menteeId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: notifs });
  } catch(e) { next(e); }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menteeId = await getMenteeId(req.user.id);
    
    // Auth check
    const notif = await prisma.notification.findUnique({ where: { id }});
    if(!notif || notif.menteeId !== menteeId) return res.status(403).json({ success: false, message: 'Unauthorized interaction on Notification Matrix' });

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.json({ success: true, data: updated });
  } catch(e) { next(e); }
};