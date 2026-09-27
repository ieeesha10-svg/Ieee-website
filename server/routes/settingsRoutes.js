const express = require('express');
const settingsRouter = express.Router();
const {
  getPublicSettings,
  getSettings,
  updateRegistrationStatus,
  updateCommitteeApplicationsStatus,
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public, so the sign-up and committees pages can render the right message
// before a visitor fills anything in.
settingsRouter.get('/public', getPublicSettings);

// Everything below needs an admin.
settingsRouter.use(protect, authorize('xcom', 'board'));

settingsRouter.get('/', getSettings);
settingsRouter.put('/registration', updateRegistrationStatus);
settingsRouter.put('/committee-applications', updateCommitteeApplicationsStatus);

module.exports = settingsRouter;
