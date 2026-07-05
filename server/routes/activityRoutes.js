const express = require('express');
const cloudinary = require('cloudinary').v2;
const activityRouter = express.Router();
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');


// cloudinary setup for activity cover image upload
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });



activityRouter.get('/', getActivities);
activityRouter.get('/:id', getActivityById);

activityRouter.use(protect, authorize('xcom','board'));
activityRouter.post('/', createActivity);
activityRouter.put('/:id', updateActivity);
activityRouter.delete('/:id', deleteActivity);

module.exports = activityRouter;