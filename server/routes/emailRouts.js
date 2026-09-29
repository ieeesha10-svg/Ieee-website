const express = require("express");
const emailRouter = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  sendBulkEmailsFromExcel,
  sendBulkEmailsFromDB,
  getPaginatedEmails,
  getEmailQuotaUsage,
} = require("../controllers/emailController");
const { protect, authorize } = require("../middleware/authMiddleware");

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
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// 1. Send Bulk
emailRouter.post(
  "/bulk-send",
  protect,
  authorize("xcom", "board"),
  upload.fields([
    { name: 'excelFile', maxCount: 1 },
    { name: 'attachments' }
  ]),
  sendBulkEmailsFromExcel,
);

emailRouter.post(
  "/bulk-send-db",
  protect,
  authorize("xcom", "board"),
  upload.fields([
    { name: 'attachments' }
  ]),
  sendBulkEmailsFromDB,
);

// 2. Logs
emailRouter.get(
  "/logs",
  protect,
  authorize("xcom", "board"),
  getPaginatedEmails,
);

// 3. Remaining transactional allowance, shown as a progress bar in settings.
// Declared after /logs so the literal paths keep matching first; Express would
// not confuse them either way, but grouping the two reads better.
emailRouter.get(
  "/quota",
  protect,
  authorize("xcom", "board"),
  getEmailQuotaUsage,
);

module.exports = emailRouter;
