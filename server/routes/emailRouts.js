const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sendBulkEmails, updateEmailSettings, getEmailLogs } = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure Multer (Temp Storage)
const upload = multer({ 
  dest: 'uploads/', 
  limits: { fileSize: 10 * 1024 * 1024 } // Increased limit to 10MB per file
});

// Update this part:
router.post('/bulk-send', 
  protect, 
  authorize('xcom', 'board'), 
  upload.fields([
    { name: 'excelFile', maxCount: 1 }, 
    { name: 'emailAttachments', maxCount: 5 } // Allow up to 5 attachments
  ]), 
  sendBulkEmails
);

// // 1. Send Bulk
// router.post('/bulk-send', protect, authorize('xcom', 'board'), upload.single('excelFile'), sendBulkEmails);

// 2. Settings
router.put('/settings', protect, authorize('xcom','board'), updateEmailSettings);

// 3. Logs
router.get('/logs', protect, authorize('xcom', 'board'), getEmailLogs);

module.exports = router;