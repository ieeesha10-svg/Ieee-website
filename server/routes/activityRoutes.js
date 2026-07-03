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

activityRouter.get('/', getActivities);
activityRouter.get('/:id', getActivityById);

activityRouter.use(protect, authorize('xcom','board'));
activityRouter.post('/', createActivity);
activityRouter.put('/:id', updateActivity);
activityRouter.delete('/:id', deleteActivity);

module.exports = activityRouter;