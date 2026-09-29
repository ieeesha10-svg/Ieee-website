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

const { protect, authorize, optionalProtect, authorizeSelfOr } = require('../middleware/authMiddleware');
const { VIEW_ROLES, SCAN_ROLES } = require('../constants/roles');

// 1. Submit �?" public route. `optionalProtect` attaches `req.user` when a valid
//    session cookie exists (for member submissions) but lets guests through.
//    The controller enforces the form's `requiresLogin` setting.
submissionRouter.post('/', optionalProtect, upload.any(), submitForm);

// 2. Scan. Scanner's one action, and board/xcom may do it too. A plain
//    "member" is excluded: they have no dashboard at all.
submissionRouter.post('/scan', protect, authorize(...SCAN_ROLES), scanTicket);

// 3. View & Export — read-only for board.
submissionRouter.get('/export/:formId', protect, authorize(...VIEW_ROLES), exportSubmissionsToExcel);
submissionRouter.get('/form/:formId', protect, authorize(...VIEW_ROLES), getSubmissionsForForm);
submissionRouter.get('/download', protect, authorize(...VIEW_ROLES), downloadFile);
// "Have I already submitted this form?" — the caller's own submission, which is
// why it lives in the public-facing form UI and only needs a session. Scoping
// the :userid to the session stops it being an IDOR over everyone else's
// answers. board/xcom keep the ability to look up any single submission.
submissionRouter.get(
  '/:userid/:formid',
  protect,
  authorizeSelfOr(...VIEW_ROLES),
  getUserSubmission,
);
submissionRouter.get('/', protect, authorize(...VIEW_ROLES), getSubmissions);
// submissionRouter.put('/:userid/:formid', protect, authorize(...WRITE_ROLES), editSubmission);

module.exports = submissionRouter; 
