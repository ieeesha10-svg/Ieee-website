const express = require('express');
const router = express.Router();
const { 
  submitForm, 
  scanTicket, 
  getSubmissions, 
  exportSubmissionsToExcel 
} = require('../controllers/submissionController');

const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Submit (Any logged-in Student/Member)
router.post('/', protect, submitForm);

// 2. Scan (Gatekeeper/Scanner/XCom)
router.post('/scan', protect, authorize('xcom', 'scanner', 'board'), scanTicket);

// 3. View & Export (Admins Only)
router.get('/', protect, authorize('xcom', 'board'), getSubmissions);
router.get('/export', protect, authorize('xcom', 'board'), exportSubmissionsToExcel);

module.exports = router; 
