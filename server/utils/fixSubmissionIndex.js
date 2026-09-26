/**
 * One-time index repair: Submission "formId + userId" unique index.
 *
 * Problem
 * -------
 * The index guarding duplicate submissions was built from an older schema that
 * declared it `unique: true, sparse: true`. MongoDB never alters the options of
 * an index that already exists, so the live index stayed non-sparse — and
 * `sparse` would not have worked anyway: for a compound index MongoDB only skips
 * a document when *every* indexed field is missing, and a guest still has
 * `formId`, so guests were indexed as `{ formId: <id>, userId: null }`.
 *
 * A guest submission has no `userId`, so every guest on a given form collapsed
 * onto the same key. The second guest to submit a form hit a duplicate-key error
 * (11000) and was rejected even though they were a different person.
 *
 * Symptom: only the first guest submission per form was ever accepted; every
 * later one came back as "You already submitted this form".
 *
 * Fix
 * ---
 * Rebuild the index from the schema, which now uses `partialFilterExpression` to
 * constrain uniqueness to submissions that actually carry a userId. Safe to run
 * more than once — it only acts when the live index does not match the schema.
 *
 * Usage:  node utils/fixSubmissionIndex.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Submission = require('../models/SubmissionModel');

const INDEX_NAME = 'formId_1_userId_1';

const isPartial = (idx) =>
  !!idx?.partialFilterExpression &&
  idx.partialFilterExpression.userId?.$type === 'objectId';

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('connected:', mongoose.connection.name);

  const indexes = await Submission.collection.indexes();
  const target = indexes.find((i) => i.name === INDEX_NAME);

  if (isPartial(target)) {
    console.log(`${INDEX_NAME} is already a partial unique index — nothing to do.`);
  } else if (!target) {
    console.log(`${INDEX_NAME} not found — rebuilding from the schema...`);
    await Submission.syncIndexes();
  } else {
    console.log(
      `${INDEX_NAME} is unique=%s sparse=%s partial=%s — rebuilding...`,
      target.unique, !!target.sparse, !!target.partialFilterExpression
    );
    await Submission.collection.dropIndex(INDEX_NAME);
    await Submission.syncIndexes();
  }

  const fixed = (await Submission.collection.indexes()).find((i) => i.name === INDEX_NAME);
  console.log('\nindex now:', JSON.stringify(fixed, null, 1));
  console.log(isPartial(fixed)
    ? '\nOK — each account can submit a form once; guests are unconstrained and de-duplicated by email.'
    : '\nWARNING — index still does not match the schema.');

  await mongoose.disconnect();
})().catch((err) => {
  console.error('index repair failed:', err);
  process.exit(1);
});
