const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// GET /api/test
router.get('/', testController.testApi);

module.exports = router;
