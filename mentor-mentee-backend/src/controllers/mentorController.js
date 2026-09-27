const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const socket = require('../socket');

// Helper to resolve Mentor UUID from User ID
const getMentorId = async (userId) => {
  const mentor = await prisma.mentor.findUnique({ where: { userId } });
  if (!mentor) throw new Error("Mentor profile not found for this user");
  return mentor.id;
};

// 1. Dashboard - Aggregated Stats & Charts
exports.getDashboard = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      select: { batches: true }
    });
    const totalMentees = await prisma.mentee.count({ where: { mentorId } });

    const upcomingMeetings = await prisma.meetingSchedule.count({
      where: { mentorId, date: { gte: new Date() } }
    });

    const issuesLogged = await prisma.issueLog.count({ where: { mentorId } });

    const pendingForms = await prisma.mentorshipForm.count({
      where: {
        status: 'SUBMITTED',
        mentee: { mentorId }
      }
    });

    const menteesList = await prisma.mentee.findMany({
      where: { mentorId },
      include: { progressRecords: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    let totalCgpa = 0;
    let cgpaComparison = [];
    let highAtt = 0, medAtt = 0, lowAtt = 0;

    menteesList.forEach(m => {
      const prog = m.progressRecords[0];
      if (prog) {
        totalCgpa += prog.cgpa;
        cgpaComparison.push({ name: m.prn, cgpa: prog.cgpa });
        if (prog.attendance >= 85) highAtt++;
        else if (prog.attendance >= 75) medAtt++;
        else lowAtt++;
      }
    });

    const averageCgpa = cgpaComparison.length ? (totalCgpa / cgpaComparison.length).toFixed(2) : 0;

    const attendanceDistribution = [
      { name: '>85%', value: highAtt },
      { name: '75-85%', value: medAtt },
      { name: '<75%', value: lowAtt }
    ];

    const issuesList = await prisma.issueLog.findMany({ where: { mentorId }, select: { issueType: true } });
    let acCount = 0, perCount = 0;
    issuesList.forEach(i => i.issueType === 'ACADEMIC' ? acCount++ : perCount++);
    const issueTypes = [
      { name: 'Academic', value: acCount },
      { name: 'Personal', value: perCount }
    ];

    res.json({
      success: true, data: {
        totalMentees, upcomingMeetings, issuesLogged, pendingForms, averageCgpa,
        batches: mentor?.batches || [],
        charts: { attendanceDistribution, issueTypes, cgpaComparison }
      }
    });
  } catch (e) { next(e); }
};

// 2. Add Mentee (Linked by PRN with Auto-Email Generation)
exports.addMentee = async (req, res, next) => {
  try {
    const { prn, name, academic_year } = req.body;
    const mentorId = await getMentorId(req.user.id);

    // --- NEW LOGIC: Generate official college email ---
    // 1. Convert name to lowercase and remove spaces (e.g., "Sakshi Pawar" -> "sakshipawar")
    const formattedName = name.toLowerCase().replace(/\s+/g, '');
    // 2. Get the last 4 digits of PRN (e.g., "256209006" -> "9006")
    const prnSuffix = prn.slice(-4);
    // 3. Construct the full email string
    const officialEmail = `${formattedName}${prnSuffix}@walchand.ac.in`;
    // ------------------------------------------------

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(prn, salt);

    // Create User record (no email field on User model — email lives on Mentee)
    const user = await prisma.user.create({
      data: {
        username: prn,
        password: hashedPassword,
        role: 'MENTEE',
        isFirstLogin: true,
        academic_year: academic_year || '2025-26'
      }
    });

    // Create Mentee record with email
    const mentee = await prisma.mentee.create({
      data: {
        userId: user.id,
        prn,
        name,
        email: officialEmail, // Injected email
        academic_year: academic_year || '2025-26',
        mentorId,
        batchName: req.body.batchName || null,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null
      }
    });


    res.status(201).json({
      success: true,
      data: mentee,
      message: `Mentee created with official email: ${officialEmail}`
    });
  } catch (e) {
    next(e);
  }
};
// 3. View My Mentees
exports.getMentees = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const mentees = await prisma.mentee.findMany({
      where: { mentorId },
      include: {
        mentorshipForm: true, // Includes form visibility for mentor mapping
        progressRecords: true
      }
    });
    res.json({ success: true, data: mentees });
  } catch (e) { next(e); }
};

exports.getMenteeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentorId = await getMentorId(req.user.id);

    const mentee = await prisma.mentee.findUnique({
      where: { id },
      include: { mentorshipForm: true, progressRecords: true }
    });

    if (!mentee || mentee.mentorId !== mentorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile view' });
    }

    res.json({ success: true, data: mentee });
  } catch (e) { next(e); }
};

// 4. Update Mentee Basic Details
exports.updateMentee = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { menteeId } = req.params;
    
    const mentee = await prisma.mentee.findFirst({ where: { id: menteeId, mentorId } });
    if (!mentee) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { name, academic_year, prn, batchName, startDate, endDate } = req.body;
    const updated = await prisma.mentee.update({
      where: { id: menteeId },
      data: {
        name,
        academic_year,
        prn,
        batchName: batchName || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });


    res.json({ success: true, data: updated, message: 'Mentee details updated successfully.' });
  } catch(e) { next(e); }
};

// 4b. Fetch Forms for Review
exports.getPendingForms = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const forms = await prisma.mentorshipForm.findMany({
      where: {
        mentee: { mentorId }
      },
      include: {
        mentee: {
          select: { name: true, prn: true, academic_year: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, data: forms });
  } catch (e) { next(e); }
};

// 5. Send/Unlock Mentorship Form (Creates PENDING link)
exports.sendMentorshipForm = async (req, res, next) => {
  try {
    const { menteeId, academic_year } = req.body;
    const mentorId = await getMentorId(req.user.id);

    const mentee = await prisma.mentee.findUnique({ where: { id: menteeId } });
    if (!mentee || mentee.mentorId !== mentorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action on this mentee' });
    }

    const form = await prisma.mentorshipForm.upsert({
      where: { menteeId },
      update: { status: 'PENDING', academic_year: academic_year || '2025-26' },
      create: {
        menteeId,
        status: 'PENDING',
        academic_year: academic_year || '2025-26',
        formData: {}
      }
    });

    const notif = await prisma.notification.create({
      data: {
        menteeId,
        title: 'Form Unlocked',
        message: 'Your Mentorship Form was unlocked. Please fill in your details.',
        academic_year: academic_year || '2025-26'
      }
    });

    // Broadcast via socket
    const userLinking = await prisma.mentee.findUnique({ where: { id: menteeId }, select: { userId: true } });
    if (userLinking?.userId) socket.emitToUser(userLinking.userId, 'new_notification', notif);

    res.json({ success: true, data: form, message: 'Form unlocked and sent to mentee.' });
  } catch (e) { next(e); }
};

// 6. Approve Form
exports.approveMentorshipForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const form = await prisma.mentorshipForm.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    res.json({ success: true, data: form, message: 'Form approved successfully.' });
  } catch (e) { next(e); }
};

// 6b. Update Form Data directly by Mentor
exports.updateMentorshipForm = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { menteeId } = req.params;
    
    const mentee = await prisma.mentee.findFirst({ where: { id: menteeId, mentorId } });
    if (!mentee) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { formData } = req.body;
    
    const form = await prisma.mentorshipForm.update({
      where: { menteeId },
      data: { formData }
    });

    res.json({ success: true, data: form, message: 'Mentorship form data updated successfully by mentor.' });
  } catch(e) { next(e); }
};

// 7. Schedule Meeting & Dispatch Notifications
exports.scheduleMeeting = async (req, res, next) => {
  try {
    const { title, date, location, academic_year, isBatch } = req.body;
    const mentorId = await getMentorId(req.user.id);

    const meeting = await prisma.meetingSchedule.create({
      data: { title, date: new Date(date), location, academic_year, isBatch, mentorId }
    });

    res.json({ success: true, data: meeting, message: 'Meeting scheduled successfully.' });

    (async () => {
      try {
        const mentor = await prisma.mentor.findUnique({
          where: { id: mentorId },
          include: { mentees: true }
        });

        if (mentor && mentor.mentees.length > 0) {
          const notifs = mentor.mentees.map(m => ({
            menteeId: m.id,
            title: 'Meeting Scheduled',
            message: `${title} on ${new Date(date).toLocaleString()} at ${location}.`,
            academic_year: academic_year || '2025-26'
          }));
          await prisma.notification.createMany({ data: notifs });

          for (const m of mentor.mentees) {
            try {
              const userLinking = await prisma.mentee.findUnique({ where: { id: m.id }, select: { userId: true } });
              if (userLinking && userLinking.userId) {
                socket.emitToUser(userLinking.userId, 'new_notification', {
                  id: 'batch_' + Date.now(),
                  menteeId: m.id,
                  title: 'Meeting Scheduled',
                  isRead: false,
                  createdAt: new Date(),
                  message: `${title} on ${new Date(date).toLocaleString()} at ${location}.`
                });
              }
            } catch (socketErr) {
              console.error(`Socket broadcast failed for mentee ${m.id}:`, socketErr.message);
            }
          }

          const emails = mentor.mentees.map(m => m.email).filter(e => e && e.includes('@'));
          if (emails.length > 0) {
            const emailHtml = `<h2>Meeting Scheduled</h2><p>Agenda: ${title}</p><p>Date: ${new Date(date).toLocaleString()}</p><p>Venue: ${location}</p>`;
            await sendEmail({ to: emails.join(','), subject: `Meeting: ${title}`, html: emailHtml });
          }
        }
      } catch (hookError) {
        console.error("Secondary Provisioning Hook Failed (Email/Socket):", hookError.message);
      }
    })();

  } catch (e) {
    if (!res.headersSent) {
      next(e);
    } else {
      console.error("Database Save Failed Pipeline Error:", e.message);
    }
  }
};

// 8. View Meetings & Reports
exports.getMeetings = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const schedules = await prisma.meetingSchedule.findMany({ where: { mentorId }, orderBy: { date: 'desc' } });
    const reports = await prisma.meetingReport.findMany({ where: { mentorId }, orderBy: { date: 'desc' } });
    res.json({ success: true, data: { schedules, reports } });
  } catch (e) { next(e); }
};

// 8b. Update Meeting Schedule
exports.updateMeetingSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentorId = await getMentorId(req.user.id);
    const { title, date, location, academic_year } = req.body;
    // Ensure the schedule belongs to this mentor
    const existing = await prisma.meetingSchedule.findFirst({ where: { id, mentorId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found or unauthorized' });
    const updated = await prisma.meetingSchedule.update({
      where: { id },
      data: { title, date: new Date(date), location, academic_year }
    });
    res.json({ success: true, data: updated, message: 'Schedule updated successfully.' });
  } catch (e) { next(e); }
};

// 8c. Delete Meeting Schedule
exports.deleteMeetingSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentorId = await getMentorId(req.user.id);
    const existing = await prisma.meetingSchedule.findFirst({ where: { id, mentorId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Schedule not found or unauthorized' });
    await prisma.meetingSchedule.delete({ where: { id } });
    res.json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (e) { next(e); }
};

// 9. Create Meeting Report Fully Implemented
exports.createMeetingReport = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { meetingNumber, attendanceCount, date, agenda, discussion, conclusion, location, className, semester, academic_year, suggestions } = req.body;

    const report = await prisma.meetingReport.create({
      data: {
        meetingNumber: parseInt(meetingNumber),
        attendanceCount: parseInt(attendanceCount),
        date: new Date(date),
        location: location || 'Virtual',
        class: className || 'General',
        semester: semester || 'Unknown',
        academic_year: academic_year || '2023-24',
        agenda,
        discussion,
        suggestions: suggestions || 'N/A',
        conclusion,
        mentorId
      }
    });

    res.json({ success: true, data: report, message: 'Meeting report digitized successfully' });
  } catch (e) { next(e); }
};

// 10. Issue Log Management
exports.addIssue = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const issue = await prisma.issueLog.create({
      data: { ...req.body, date: new Date(req.body.date), followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null, mentorId }
    });
    res.json({ success: true, data: issue });
  } catch (e) { next(e); }
};

exports.getIssues = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const issues = await prisma.issueLog.findMany({
      where: { mentorId },
      include: { mentee: { select: { name: true, prn: true } } },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: issues });
  } catch (e) { next(e); }
};

// 11. View Student Progress
exports.getMenteeProgress = async (req, res, next) => {
  try {
    const { menteeId } = req.params;
    const mentorId = await getMentorId(req.user.id);
    const mentee = await prisma.mentee.findFirst({ where: { id: menteeId, mentorId } });
    if (!mentee) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const progress = await prisma.progressRecord.findMany({ where: { menteeId }, orderBy: { createdAt: 'asc' } });
    res.json({ success: true, data: progress });
  } catch (e) { next(e); }
};

exports.addMenteeProgress = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { menteeId } = req.params;
    
    const mentee = await prisma.mentee.findFirst({ where: { id: menteeId, mentorId } });
    if (!mentee) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { semester, academic_year, cgpa, attendance, backlogs, technicalSkills, communicationSkills, activities, certifications, internships, projects, selfRating } = req.body;
    const autoScore = (parseFloat(cgpa) * 4) + (parseFloat(attendance) * 0.3) + (parseInt(selfRating) * 3);

    const prog = await prisma.progressRecord.create({
      data: {
        menteeId, semester, academic_year, cgpa: parseFloat(cgpa), attendance: parseFloat(attendance),
        backlogs: parseInt(backlogs), technicalSkills: technicalSkills||'', communicationSkills: communicationSkills||'', activities: activities||'', certifications: certifications||'',
        internships: internships||'', projects: projects||'', selfRating: parseInt(selfRating), autoScore
      }
    });
    res.json({ success: true, data: prog, message: 'Progress recorded successfully.' });
  } catch(e) { next(e); }
};

exports.updateMenteeProgress = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { progressId } = req.params;
    
    const existing = await prisma.progressRecord.findUnique({
      where: { id: progressId },
      include: { mentee: true }
    });

    if (!existing || existing.mentee.mentorId !== mentorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { semester, academic_year, cgpa, attendance, backlogs, technicalSkills, communicationSkills, activities, certifications, internships, projects, selfRating } = req.body;
    const autoScore = (parseFloat(cgpa) * 4) + (parseFloat(attendance) * 0.3) + (parseInt(selfRating) * 3);

    const prog = await prisma.progressRecord.update({
      where: { id: progressId },
      data: {
        semester, academic_year, cgpa: parseFloat(cgpa), attendance: parseFloat(attendance),
        backlogs: parseInt(backlogs), technicalSkills: technicalSkills||'', communicationSkills: communicationSkills||'', activities: activities||'', certifications: certifications||'',
        internships: internships||'', projects: projects||'', selfRating: parseInt(selfRating), autoScore
      }
    });

    res.json({ success: true, data: prog, message: 'Progress updated successfully' });
  } catch (e) {
    next(e);
  }
};

// 12. Feedback / Guidance - Fully Implemented

exports.sendGuidance = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { menteeId, content, academic_year } = req.body;

    // VALIDATION: Prevent crash if ID is missing in the body
    if (!menteeId || menteeId === 'undefined') {
      return res.status(400).json({ success: false, message: "Target Mentee ID is required" });
    }

    const message = await prisma.guidanceMessage.create({
      data: {
        content,
        academic_year: academic_year || '2025-26',
        mentorId,
        menteeId,
        isFromMentor: true
      }
    });

    // Notification and Socket logic...
    const notif = await prisma.notification.create({
      data: {
        menteeId,
        title: 'Feedback Received',
        message: 'Your Mentor has provided professional guidance.',
        academic_year: academic_year || '2025-26'
      }
    });

    const userLinking = await prisma.mentee.findUnique({ where: { id: menteeId }, select: { userId: true } });
    if (userLinking?.userId) {
      socket.emitToUser(userLinking.userId, 'new_notification', notif);
      socket.emitToUser(userLinking.userId, 'new_message', message);
    }

    res.json({ success: true, data: message });
  } catch (e) {
    console.error("Guidance Dispatch Error:", e.message);
    next(e);
  }
};

// 13. Get Messages (Mentor Side Guidance Flow) - Connected
exports.getGuidance = async (req, res, next) => {
  try {
    const { menteeId } = req.params;

    // Strict Malformed UUID Boundary
    if (!menteeId || menteeId === 'undefined' || menteeId.length < 30) {
      return res.status(400).json({ success: false, message: "Malformed UUID Parameter Detected" });
    }

    const mentorId = await getMentorId(req.user.id);
    // Explicit cross-reference query handles the fetch securely isolating the chat to only these members
    const msgs = await prisma.guidanceMessage.findMany({
      where: { menteeId, mentorId },
      orderBy: { createdAt: 'asc' },
      include: { mentee: { select: { name: true } } }
    });
    res.json({ success: true, data: msgs });
  } catch (e) { next(e); }
};

// 14. Full Profile Fetch (Resolving 'Mentee disconnected' URL bugs) - Explicit menteeId handling
exports.getMenteeFullProfile = async (req, res, next) => {
  try {
    const { menteeId } = req.params;

    // Strict Malformed UUID Boundary
    if (!menteeId || menteeId === 'undefined' || menteeId.length < 30) {
      return res.status(400).json({ success: false, message: "Malformed UUID Parameter Detected" });
    }

    const mentorId = await getMentorId(req.user.id);

    // Binds explicitly to menteeId coming from route /mentees/:menteeId
    const profile = await prisma.mentee.findFirst({
      where: { id: menteeId, mentorId },
      include: {
        mentorshipForm: true,
        progressRecords: { orderBy: { createdAt: 'desc' } },
        issues: true,
        achievements: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!profile) return res.status(404).json({ success: false, message: 'Student disconnected or unauthorized context' });

    res.json({ success: true, data: profile });
  } catch (e) { next(e); }
};

// 15. Batch Control
exports.updateBatches = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { batches } = req.body;

    const mentor = await prisma.mentor.update({
      where: { id: mentorId },
      data: { batches }
    });
    
    res.json({ success: true, data: mentor.batches, message: 'Batches updated successfully.' });
  } catch (e) { next(e); }
};