const express = require('express');
const activityRouter = express.Router();
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');

activityRouter.post('/', createActivity);
activityRouter.get('/', getActivities);
activityRouter.get('/:id', getActivityById);
activityRouter.put('/:id', updateActivity);
activityRouter.delete('/:id', deleteActivity);

module.exports = activityRouter;