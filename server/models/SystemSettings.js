const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global_settings' }, // Singleton
  emailUser: { type: String, required: true },
  emailPass: { type: String, required: true }, // App Password
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
module.exports = SystemSettings;