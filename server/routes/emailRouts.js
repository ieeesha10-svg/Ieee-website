const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const { sendBulkEmails, updateEmailSettings, getEmailLogs, testBulkEmailsSender} = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure Multer (Temp Storage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Update this part:
/*
router.post('/bulk-send', 
  protect, 
  authorize('xcom', 'board'), 
  upload.fields([
    { name: 'excelFile', maxCount: 1 }, 
    { name: 'emailAttachments', maxCount: 5 } // Allow up to 5 attachments
  ]), 
  sendBulkEmails
);
*/

// // 1. Send Bulk
// router.post('/bulk-send', protect, authorize('xcom', 'board'), upload.single('excelFile'), sendBulkEmails);
router.post('/bulk-send', /*protect, authorize('xcom', 'board'),*/ upload.single('excelFile'), sendBulkEmails);

// 2. Settings
router.put('/settings', protect, authorize('xcom','board'), updateEmailSettings);

// 3. Logs
router.get('/logs', protect, authorize('xcom', 'board'), getEmailLogs);

module.exports = router;