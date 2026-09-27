const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');

// ─── Helper Resolvers ──────────────────────────────────────────────────────────
const getMenteeId = async (userId) => {
  const mentee = await prisma.mentee.findUnique({ where: { userId } });
  if (!mentee) throw new Error('Mentee profile not found for this user context');
  return mentee.id;
};

const getMentorId = async (userId) => {
  const mentor = await prisma.mentor.findUnique({ where: { userId } });
  if (!mentor) throw new Error('Mentor profile not found for this user');
  return mentor.id;
};

// ─── Mentee: Add Achievement ────────────────────────────────────────────────────
exports.addAchievement = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const { type, title, description, link, academic_year, certificateBase64 } = req.body;

    let certificate_url = null;
    if (certificateBase64) {
      const upload = await cloudinary.uploader.upload(certificateBase64, {
        folder: 'achievements',
        resource_type: 'auto'
      });
      certificate_url = upload.secure_url;
    }

    const achievement = await prisma.achievement.create({
      data: {
        type,
        title,
        description,
        link: link || null,
        certificate_url,
        academic_year: academic_year || '2025-26',
        menteeId
      }
    });

    res.status(201).json({ success: true, data: achievement, message: 'Achievement logged successfully.' });
  } catch (e) { next(e); }
};

// ─── Mentee: Get Own Achievements ──────────────────────────────────────────────
exports.getAchievements = async (req, res, next) => {
  try {
    const menteeId = await getMenteeId(req.user.id);
    const achievements = await prisma.achievement.findMany({
      where: { menteeId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: achievements });
  } catch (e) { next(e); }
};

// ─── Mentee: Delete Achievement ────────────────────────────────────────────────
exports.deleteAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const menteeId = await getMenteeId(req.user.id);

    const existing = await prisma.achievement.findUnique({ where: { id } });
    if (!existing || existing.menteeId !== menteeId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action on this achievement.' });
    }

    await prisma.achievement.delete({ where: { id } });
    res.json({ success: true, message: 'Achievement removed.' });
  } catch (e) { next(e); }
};

// ─── Mentor: Comparative Matrix ────────────────────────────────────────────────
// Returns all mentees under this mentor along with their achievements for matrix view
exports.getAchievementMatrix = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);

    const mentees = await prisma.mentee.findMany({
      where: { mentorId },
      select: {
        id: true,
        name: true,
        prn: true,
        academic_year: true,
        batchName: true,
        achievements: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Build summary stats per mentee
    const matrix = mentees.map(m => {
      const byType = { HACKATHON: 0, INTERNSHIP: 0, PROJECT: 0, COMPETITION: 0 };
      m.achievements.forEach(a => { if (byType[a.type] !== undefined) byType[a.type]++; });
      return {
        id: m.id,
        name: m.name,
        prn: m.prn,
        academic_year: m.academic_year,
        batchName: m.batchName || 'Unassigned',
        totalAchievements: m.achievements.length,
        byType,
        achievements: m.achievements
      };
    });

    res.json({ success: true, data: matrix });
  } catch (e) { next(e); }
};

// ─── Mentor: Get a Single Mentee's Achievements ────────────────────────────────
exports.getMenteeAchievements = async (req, res, next) => {
  try {
    const { menteeId } = req.params;
    const mentorId = await getMentorId(req.user.id);

    // Security: ensure this mentee belongs to the mentor
    const mentee = await prisma.mentee.findFirst({ where: { id: menteeId, mentorId } });
    if (!mentee) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const achievements = await prisma.achievement.findMany({
      where: { menteeId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: achievements });
  } catch (e) { next(e); }
};

// ─── Mentor: Update Mentee Achievement ─────────────────────────────────────────
exports.updateAchievementByMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentorId = await getMentorId(req.user.id);
    const { type, title, description, link, academic_year } = req.body;

    const existing = await prisma.achievement.findUnique({
      where: { id },
      include: { mentee: true }
    });

    if (!existing || existing.mentee.mentorId !== mentorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action on this achievement.' });
    }

    const updated = await prisma.achievement.update({
      where: { id },
      data: { type, title, description, link: link || null, academic_year }
    });

    res.json({ success: true, data: updated, message: 'Achievement updated successfully.' });
  } catch(e) { next(e); }
};

// ─── Mentor: Update Own Profile ────────────────────────────────────────────────
exports.updateMentorProfile = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const { name, email, department, academic_year } = req.body;

    const updated = await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(department && { department }),
        ...(academic_year && { academic_year })
      }
    });

    res.json({ success: true, data: updated, message: 'Profile updated successfully.' });
  } catch (e) { next(e); }
};

// ─── Mentor: Get Own Profile ───────────────────────────────────────────────────
exports.getMentorProfile = async (req, res, next) => {
  try {
    const mentorId = await getMentorId(req.user.id);
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: { _count: { select: { mentees: true } } }
    });
    res.json({ success: true, data: mentor });
  } catch (e) { next(e); }
};
