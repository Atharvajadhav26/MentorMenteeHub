const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Protect and Restrict ALL routes to ADMIN
router.use(protect, authorizeRoles('ADMIN'));

// 1. Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// 2. Mentors
router.post('/mentors', adminController.addMentor);
router.get('/mentors', adminController.getMentors);
router.put('/mentors/:id', adminController.updateMentor);
router.delete('/mentors/:id', adminController.deactivateMentor);

// 3. Mentees
router.get('/mentees', adminController.getMentees);
router.get('/mentees/:id', adminController.getMenteeDetails);

// 4. Reports (Visible Admin Side)
router.get('/forms', adminController.getForms);
router.get('/meetings', adminController.getMeetings);
router.get('/issues', adminController.getIssues);

// 5. Export Logic Routes
router.get('/export/pdf/:studentId', adminController.exportStudentPdf);
router.get('/export/excel', adminController.exportSystemExcel);

module.exports = router;
