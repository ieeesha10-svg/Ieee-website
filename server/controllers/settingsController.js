const { catchAsync, AppError } = require('../middleware/errorsMiddleware');
const SiteSetting = require('../models/SiteSettingModel');

/**
 * Reads the single settings document, creating it on first use.
 *
 * `findOneAndUpdate` with an upsert rather than find-then-create, so two
 * requests arriving together on a brand new database cannot both try to insert
 * and one of them fail.
 *
 * Note: `returnDocument: 'after'` rather than the older `new: true`, which
 * mongoose 9 deprecates.
 */
const readSettings = () =>
  SiteSetting.findOneAndUpdate(
    {},
    { $setOnInsert: { registrationOpen: true, committeeApplicationsOpen: true } },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }
  );

// Both switches, in the shape the admin settings endpoint returns.
const toPayload = (settings) => ({
  registrationOpen: settings.registrationOpen,
  committeeApplicationsOpen: settings.committeeApplicationsOpen,
  updatedAt: settings.updatedAt,
});

/**
 * Sets one boolean switch and returns the stored document.
 *
 * Reads first so an install that has never been configured still gets a
 * document to update rather than failing to match one.
 */
const setSwitch = async (field, value) => {
  if (typeof value !== 'boolean') {
    throw new AppError(`${field} must be true or false`, 400);
  }

  await readSettings();
  const updated = await SiteSetting.findOneAndUpdate(
    {},
    { $set: { [field]: value } },
    { returnDocument: 'after' }
  );

  return toPayload(updated);
};

// @desc Public site switches, used by the sign-up and committees pages
// @route GET /api/settings/public
// @access Public
const getPublicSettings = catchAsync(async (req, res) => {
  const settings = await readSettings();

  res.status(200).json({
    success: true,
    ...toPayload(settings),
  });
});

// @desc All site settings (admin)
// @route GET /api/settings
// @access Admin
const getSettings = catchAsync(async (req, res) => {
  const settings = await readSettings();

  res.status(200).json({
    success: true,
    settings: toPayload(settings),
  });
});

// @desc Open or close registration (admin)
// @route PUT /api/settings/registration
// @access Admin
const updateRegistrationStatus = catchAsync(async (req, res) => {
  const settings = await setSwitch('registrationOpen', req.body.registrationOpen);

  res.status(200).json({ success: true, settings });
});

// @desc Open or close committee applications (admin)
// @route PUT /api/settings/committee-applications
// @access Admin
const updateCommitteeApplicationsStatus = catchAsync(async (req, res) => {
  const settings = await setSwitch(
    'committeeApplicationsOpen',
    req.body.committeeApplicationsOpen
  );

  res.status(200).json({ success: true, settings });
});

module.exports = {
  readSettings,
  getPublicSettings,
  getSettings,
  updateRegistrationStatus,
  updateCommitteeApplicationsStatus,
};
