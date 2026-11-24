const mongoose = require('mongoose');

// One document per backup operation. `createdAt` (from timestamps) is when it ran.
// The file itself never lives on the server, so there is no filename to keep.
const backupLogSchema = new mongoose.Schema({
  // 'download' -> an admin downloaded a copy of the database
  // 'restore'  -> an admin restored a copy from their device
  type: { type: String, enum: ['download', 'restore'], default: 'download' },
  collections: { type: [String], default: [] },
  totalDocuments: { type: Number, default: 0 },
  // What the database looked like when the operation ran, as
  // { counts: { collection: number }, hashes: { collection: sha256 } }.
  // A restore compares this against the live database to confirm the copy the
  // admin is holding really is a copy of the data about to be replaced. Counts
  // alone would miss an edit that leaves the number of documents unchanged, so
  // the content hashes do the real work.
  fingerprint: { type: mongoose.Schema.Types.Mixed, default: {} },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedByName: { type: String, default: '' },
  performedByEmail: { type: String, default: '' },
}, { timestamps: true });

const BackupLog = mongoose.model('BackupLog', backupLogSchema);
module.exports = BackupLog;
