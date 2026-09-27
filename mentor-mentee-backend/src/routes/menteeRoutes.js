const express = require('express');
const router = express.Router();
const menteeController = require('../controllers/menteeController');
const achievementController = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Protect and Restrict ALL routes to MENTEE role
router.use(protect, authorizeRoles('MENTEE'));

// 1. Profile & Dashboard
router.get('/dashboard', menteeController.getDashboard);
router.get('/profile', menteeController.getProfile);

// 2. Mentorship Form (Student Side)
router.get('/forms', menteeController.getMentorshipForm);
router.post('/forms/fill', menteeController.fillMentorshipForm);

// 3. Progress Tracking
router.get('/progress', menteeController.getProgress);
router.get('/progress/report', menteeController.getProgress);
router.post('/progress', menteeController.addProgress);

// 4. Communication & Notifications
router.get('/messages', menteeController.getMessages);
router.post('/messages', menteeController.sendMessage);

router.get('/meetings', menteeController.getMeetings);
router.get('/notifications', menteeController.getNotifications);
router.put('/notifications/:id/read', menteeController.markNotificationRead);

// 5. Achievements
router.get('/achievements', achievementController.getAchievements);
router.post('/achievements', achievementController.addAchievement);
router.delete('/achievements/:id', achievementController.deleteAchievement);

module.exports = router;