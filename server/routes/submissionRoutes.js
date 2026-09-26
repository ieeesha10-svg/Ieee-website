const express = require('express');
const submissionRouter = express.Router();
const { 
  submitForm, 
  scanTicket, 
  getUserSubmission,
  getSubmissions,
  getSubmissionsForForm,
  editSubmission, 
  exportSubmissionsToExcel,
  downloadFile
} = require('../controllers/submissionController');
const upload = require('../middleware/uploadMiddleware');

const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

// 1. Submit — public route. `optionalProtect` attaches `req.user` when a valid
//    session cookie exists (for member submissions) but lets guests through.
//    The controller enforces the form's `requiresLogin` setting.
submissionRouter.post('/', optionalProtect, upload.any(), submitForm);

// Everything below requires authentication.
submissionRouter.use(protect);

// 2. Scan (all roles except user)
submissionRouter.post('/scan', authorize('xcom', 'scanner', 'board', 'member'), scanTicket);

// 3. View & Export (Admins Only)
submissionRouter.get('/export/:formId', authorize('xcom', 'board'), exportSubmissionsToExcel);
submissionRouter.get('/form/:formId', authorize('xcom', 'board'), getSubmissionsForForm);
submissionRouter.get('/download', authorize('xcom', 'board'), downloadFile);
submissionRouter.get('/:userid/:formid', protect, getUserSubmission);
submissionRouter.get('/', authorize('xcom', 'board'), getSubmissions);
// submissionRouter.put('/:userid/:formid', authorize('xcom', 'board'), editSubmission);

module.exports = submissionRouter; 
