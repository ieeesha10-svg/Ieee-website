/**
 * One-off migration: give every existing activity an explicit `showOnSite` (and
 * `registrationEnabled`) value.
 *
 * Why this is needed, and it is not obvious: Mongoose applies schema defaults when
 * it *hydrates* a document as well as when it creates one. So an activity stored
 * before these fields existed comes back from `findById()` with `showOnSite`
 * reading as `true` in JavaScript - but the raw BSON has no such key, so a query
 * against it, `{ showOnSite: true }`, does not match. The two views of the same
 * document disagree.
 *
 * That matters because the public reads filter with the query, while anything
 * reading a hydrated document would see the default. Before this ran, a
 * field-less activity was excluded from the public events list but still opened
 * fine by direct id. Writing the value down makes the stored document mean one
 * thing, so the query and the document can no longer disagree.
 *
 * Only fields that are absent are written. An activity that already says
 * `showOnSite: false` was deliberately hidden and is left hidden - a backfill
 * that reset everything to `true` would republish drafts.
 *
 * Run with:  node server/scripts/backfill-activity-show-on-site.js
 *
 * Dry run first:  node server/scripts/backfill-activity-show-on-site.js --dry-run
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Activity = require('../models/ActivityModel');

const DRY_RUN = process.argv.includes('--dry-run');

// `{ $exists: false }` alone would also match a field explicitly set to null,
// which `updateMany` would then overwrite. A null is not something this codebase
// ever writes, but treating "unset" and "explicitly false" differently costs one
// extra clause and removes the ambiguity.
const unsetOrNull = (field) => ({ $or: [{ [field]: { $exists: false } }, { [field]: null }] });

const main = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Expected it in server/.env');
  }

  await mongoose.connect(uri);
  console.log('Connected.\n');

  const total = await Activity.countDocuments();
  console.log(`Activities: ${total}`);

  // Check first, so an unexpected count is visible before anything is written.
  const needsShow = await Activity.find(unsetOrNull('showOnSite'), 'title createdAt').lean();
  const needsReg = await Activity.find(unsetOrNull('registrationEnabled'), 'title createdAt').lean();

  console.log(`\nMissing showOnSite          : ${needsShow.length}`);
  if (needsShow.length) {
    console.log('Will be set to true:');
    needsShow.forEach((a) => console.log(`  ${a.title}  (${a._id})`));
  }

  console.log(`\nMissing registrationEnabled : ${needsReg.length}`);
  if (needsReg.length) {
    console.log('Will be set to true:');
    needsReg.forEach((a) => console.log(`  ${a.title}  (${a._id})`));
  }

  // Reported for reassurance, not modified: these already carry a deliberate
  // value and must survive the backfill untouched.
  const hidden = await Activity.countDocuments({ showOnSite: false });
  const unpublished = await Activity.countDocuments({ registrationEnabled: false });
  if (hidden) {
    console.log(`\n${hidden} activity/activities already hidden (showOnSite: false) - left as they are.`);
  }
  if (unpublished) {
    console.log(`${unpublished} activity/activities already closed for registration - left as they are.`);
  }

  if (DRY_RUN) {
    console.log('\nDry run - nothing written.');
  } else if (needsShow.length || needsReg.length) {
    if (needsShow.length) {
      const r = await Activity.updateMany(unsetOrNull('showOnSite'), { $set: { showOnSite: true } });
      console.log(`\nSet showOnSite: true on ${r.modifiedCount} activity/activities.`);
    }
    if (needsReg.length) {
      const r = await Activity.updateMany(unsetOrNull('registrationEnabled'), { $set: { registrationEnabled: true } });
      console.log(`Set registrationEnabled: true on ${r.modifiedCount} activity/activities.`);
    }
  } else {
    console.log('\nNothing to do - every activity already has both fields.');
  }

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error('\nMigration failed:', err.message);
  try {
    await mongoose.disconnect();
  } catch {
    /* already disconnected */
  }
  process.exit(1);
});
