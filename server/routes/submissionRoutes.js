const express = require('express');
const submissionRouter = express.Router();
const { 
  submitForm, 
  scanTicket, 
  getSubmissions, 
  exportSubmissionsToExcel 
} = require('../controllers/submissionController');

const { protect, authorize } = require('../middleware/authMiddleware');
submissionRouter.use(protect); // All routes require authentication
// 1. Submit (Any logged-in Student/Member)
submissionRouter.post('/', submitForm);

// 2. Scan (Gatekeeper/Scanner/XCom)
submissionRouter.post('/scan', authorize('xcom', 'scanner', 'board'), scanTicket);

// 3. View & Export (Admins Only)
submissionRouter.get('/', authorize('xcom', 'board'), getSubmissions);
submissionRouter.get('/export', authorize('xcom', 'board'), exportSubmissionsToExcel);

module.exports = submissionRouter; 
