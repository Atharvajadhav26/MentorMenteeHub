const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const achievementController = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Protect and Restrict ALL routes to MENTOR role
router.use(protect, authorizeRoles('MENTOR'));

// 1. Dashboard
router.get('/dashboard', mentorController.getDashboard);

// 2. Mentee Management
router.post('/mentees', mentorController.addMentee);
router.get('/mentees', mentorController.getMentees);
router.put('/mentees/:menteeId', mentorController.updateMentee);
// This handles the "View Profile" click (Matching backend UUID parameter 'menteeId')
router.get('/mentees/:menteeId', mentorController.getMenteeFullProfile);

// 3. Form Management
router.get('/forms', mentorController.getPendingForms);
router.post('/forms/send', mentorController.sendMentorshipForm);
router.put('/forms/:menteeId', mentorController.updateMentorshipForm);
router.put('/forms/:id/approve', mentorController.approveMentorshipForm);

// 4. Meetings & Reports
router.post('/meetings', mentorController.scheduleMeeting);
router.get('/meetings', mentorController.getMeetings);
router.put('/meetings/:id', mentorController.updateMeetingSchedule);
router.delete('/meetings/:id', mentorController.deleteMeetingSchedule);
router.post('/meeting-reports', mentorController.createMeetingReport);

// 5. Issues & Logs
router.post('/issues', mentorController.addIssue);
router.get('/issues', mentorController.getIssues);

// 5b. Progress 
router.post('/progress/:menteeId', mentorController.addMenteeProgress);
router.put('/progress/:progressId', mentorController.updateMenteeProgress);

// 6. Messaging / Guidance Workflow (Fully Implemented)
router.get('/guidance/:menteeId', mentorController.getGuidance);
router.post('/guidance', mentorController.sendGuidance);

// 7. Achievement Matrix & Per-Mentee Achievements
router.get('/achievements/matrix', achievementController.getAchievementMatrix);
router.get('/achievements/:menteeId', achievementController.getMenteeAchievements);
router.put('/achievements/:id', achievementController.updateAchievementByMentor);

// 8. Mentor Own Profile (View + Edit)
router.get('/profile', achievementController.getMentorProfile);
router.put('/profile', achievementController.updateMentorProfile);

// 9. Batch Management
router.put('/batches', mentorController.updateBatches);

module.exports = router;