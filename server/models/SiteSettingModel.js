const mongoose = require('mongoose');

// Site-wide switches, kept in a single document so there is one place to read
// global state from. Both default to on, so a fresh install behaves normally
// until an admin says otherwise.
//
// Neither switch affects people who are already members: `registrationOpen`
// gates the sign-up form only, so closing it never locks anyone out, and
// `committeeApplicationsOpen` only stops new committee requests while leaving
// the board able to review the ones already submitted.
const siteSettingSchema = new mongoose.Schema({
  registrationOpen: { type: Boolean, default: true },
  committeeApplicationsOpen: { type: Boolean, default: true },
}, { timestamps: true });

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);
module.exports = SiteSetting;
