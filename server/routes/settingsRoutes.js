const express = require('express');
const settingsRouter = express.Router();
const {
  getPublicSettings,
  getSettings,
  updateRegistrationStatus,
  updateCommitteeApplicationsStatus,
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { VIEW_ROLES, WRITE_ROLES } = require('../constants/roles');

// Public, so the sign-up and committees pages can render the right message
// before a visitor fills anything in.
settingsRouter.get('/public', getPublicSettings);

// Reading the full settings is fine for board; changing them is not.
settingsRouter.get('/', protect, authorize(...VIEW_ROLES), getSettings);

settingsRouter.put('/registration', protect, authorize(...WRITE_ROLES), updateRegistrationStatus);
settingsRouter.put('/committee-applications', protect, authorize(...WRITE_ROLES), updateCommitteeApplicationsStatus);

module.exports = settingsRouter;
