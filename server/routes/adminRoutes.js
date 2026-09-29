const express = require('express');
const os = require('os');
const multer = require('multer');
const adminRouter = express.Router();
const {
  downloadBackup,
  getBackupSummary,
  importBackup,
} = require('../controllers/backupController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { VIEW_ROLES, WRITE_ROLES } = require('../constants/roles');
const { AppError } = require('../middleware/errorsMiddleware');

const MAX_UPLOAD_MB = Number(process.env.MAX_BACKUP_SIZE_MB) || 200;

// A full database dump is far bigger than the 10 MB image limit, so the upload
// goes to the OS temp directory instead of RAM and is deleted once parsed.
const upload = multer({
  storage: multer.diskStorage({ destination: os.tmpdir() }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

const acceptBackup = (req, res, next) => {
  upload.single('backupFile')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(
        `That file is too large. The maximum backup size is ${MAX_UPLOAD_MB} MB.`,
        413
      ));
    }
    next(err);
  });
};

// Downloading a backup reads the whole database, so board is allowed; restoring
// one overwrites it, so only xcom may.
adminRouter.get('/backup', protect, authorize(...VIEW_ROLES), downloadBackup);
adminRouter.get('/backup/summary', protect, authorize(...VIEW_ROLES), getBackupSummary);
adminRouter.post('/backup/import', protect, authorize(...WRITE_ROLES), acceptBackup, importBackup);

module.exports = adminRouter;
