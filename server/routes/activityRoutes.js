const express = require('express');
const activityRouter = express.Router();
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

activityRouter.get('/', getActivities);
activityRouter.get('/:id', getActivityById);

activityRouter.use(protect, authorize('xcom','board'));
activityRouter.post('/', upload.single('coverImage'), createActivity);
activityRouter.put('/:id', upload.single('coverImage'), updateActivity);
activityRouter.delete('/:id', deleteActivity);

module.exports = activityRouter;