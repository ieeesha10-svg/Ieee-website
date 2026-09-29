/**
 * One-off migration: the "user" role was removed. Every account still carrying
 * it becomes a "member", which is what a fresh registration now produces.
 *
 * Why this exists rather than a default: Mongoose only applies `default` when a
 * document is created, so existing documents keep their stored value. Without
 * this, those users would hold a role that is no longer in the enum, and the
 * first save on any of them would fail validation.
 *
 * Run with:  node server/scripts/migrate-role-user-to-member.js
 *
 * Dry run first:  node server/scripts/migrate-role-user-to-member.js --dry-run
 *
 * It only touches role === "user". Anything else is left alone, so it is safe to
 * run more than once.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/UserModel');

const DRY_RUN = process.argv.includes('--dry-run');

const main = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Expected it in server/.env');
  }

  await mongoose.connect(uri);
  console.log('Connected.\n');

  // Check first, so an unexpected count is visible before anything is written.
  const affected = await User.find({ role: 'user' }, 'name email role').lean();
  console.log(`Accounts with role "user": ${affected.length}`);

  if (affected.length) {
    console.log('\nWill be changed to "member":');
    affected.forEach((u) => console.log(`  ${u.email}  (${u.name})`));
  }

  // Anything holding some *other* role that is not in the enum would also break
  // on its next save, and this script deliberately does not guess at a fix.
  // "user" is excluded because it is already listed above and gets migrated.
  const valid = User.schema.path('role').enumValues;
  const strays = await User.find(
    { role: { $nin: [...valid, 'user'] } },
    'name email role'
  ).lean();
  if (strays.length) {
    console.log(`\nWARNING: ${strays.length} account(s) hold an unexpected role:`);
    strays.forEach((u) => console.log(`  ${u.email}  role=${u.role} (${u.name})`));
    console.log('These are NOT touched by this script. Fix them by hand.');
  }

  if (DRY_RUN) {
    console.log('\nDry run - nothing written.');
  } else if (affected.length) {
    const result = await User.updateMany({ role: 'user' }, { $set: { role: 'member' } });
    console.log(`\nUpdated ${result.modifiedCount} account(s) to "member".`);
  } else {
    console.log('\nNothing to do.');
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
