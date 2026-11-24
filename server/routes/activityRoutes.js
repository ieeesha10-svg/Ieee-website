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
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');
const { WRITE_ROLES } = require('../constants/roles');
const upload = require('../middleware/uploadMiddleware');

// `optionalProtect` rather than `protect`: these reads are public, but a signed-in
// writer gets to see unpublished activities so the dashboard can list and edit
// them. It attaches req.user when a valid token is present and otherwise leaves
// it undefined and continues, so an anonymous visitor is unaffected. The
// controller decides what that means - it never trusts a query flag to reveal
// hidden activities, because the endpoint is reachable without a token.
activityRouter.get('/', optionalProtect, getActivities);
activityRouter.get('/featured', optionalProtect, getFeaturedActivities);
activityRouter.get('/:id', optionalProtect, getActivityById);

// The reads above are public, so board needs nothing extra here. Everything
// below mutates and is xcom-only - board is read-only.
//
// The guard is repeated on each route rather than applied once with
// `router.use(...)`. A router-level use() only covers what is registered
// *after* it, so a route added above the line would be public by accident and
// nothing would say so. Spelling it out per route is what the other routers do,
// and it makes the permission of every endpoint greppable.
activityRouter.post('/', protect, authorize(...WRITE_ROLES), upload.single('coverImage'), createActivity);
activityRouter.post('/swap-featured', protect, authorize(...WRITE_ROLES), swapFeaturedActivities);
activityRouter.put('/:id', protect, authorize(...WRITE_ROLES), upload.single('coverImage'), updateActivity);
activityRouter.delete('/:id', protect, authorize(...WRITE_ROLES), deleteActivity);
activityRouter.post('/:id/add-featured', protect, authorize(...WRITE_ROLES), addFeaturedActivity);
activityRouter.delete('/:id/remove-featured', protect, authorize(...WRITE_ROLES), removeFeaturedActivity);

module.exports = activityRouter;