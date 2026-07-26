const express = require('express');
const activityRouter = express.Router();
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  addFeaturedActivity,
  removeFeaturedActivity,
  getFeaturedActivities,
  swapFeaturedActivities
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

activityRouter.get('/', getActivities);
activityRouter.get('/featured', getFeaturedActivities);
activityRouter.get('/:id', getActivityById);

activityRouter.use(protect, authorize('xcom','board'));
activityRouter.post('/', upload.single('coverImage'), createActivity);
activityRouter.post('/swap-featured', swapFeaturedActivities);
activityRouter.put('/:id', upload.single('coverImage'), updateActivity);
activityRouter.delete('/:id', deleteActivity);
activityRouter.post('/:id/add-featured', addFeaturedActivity);
activityRouter.delete('/:id/remove-featured', removeFeaturedActivity);

module.exports = activityRouter;