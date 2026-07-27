const express = require('express');
const submissionRouter = express.Router();
const { 
  submitForm, 
  scanTicket, 
  getUserSubmission,
  getSubmissions,
  getSubmissionsForForm,
  editSubmission, 
  exportSubmissionsToExcel 
} = require('../controllers/submissionController');
const upload = require('../middleware/uploadMiddleware');

const { protect, authorize } = require('../middleware/authMiddleware');
submissionRouter.use(protect); // All routes require authentication
// 1. Submit (Any logged-in Student/Member)
submissionRouter.post('/', upload.any(), submitForm);

// 2. Scan (Gatekeeper/Scanner/XCom)
submissionRouter.post('/scan', authorize('xcom', 'scanner', 'board'), scanTicket);

// 3. View & Export (Admins Only)
submissionRouter.get('/export/:formId', authorize('xcom', 'board'), exportSubmissionsToExcel);
submissionRouter.get('/form/:formId', authorize('xcom', 'board'), getSubmissionsForForm);
submissionRouter.get('/:userid/:formid', protect, getUserSubmission);
submissionRouter.get('/', authorize('xcom', 'board'), getSubmissions);
// submissionRouter.put('/:userid/:formid', authorize('xcom', 'board'), editSubmission);

module.exports = submissionRouter; 
