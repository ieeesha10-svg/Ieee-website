const fs = require('fs/promises');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { catchAsync, AppError } = require('../middleware/errorsMiddleware');
const BackupLog = require('../models/BackupLogModel');

/**
 * Backups are built by reading the collections straight out of MongoDB
 * (no mongodump), and are restored by clearing each collection and re-inserting
 * the documents from the uploaded file.
 *
 * Nothing is ever stored on the server: a backup is streamed to the admin's
 * device as a download, exactly like the manual button. A restore is only
 * allowed once a recent download of the unchanged data proves the admin is
 * holding a current copy.
 *
 * Documents are written as MongoDB Extended JSON, so BSON types (dates,
 * ObjectIds, binary, 64-bit numbers) survive the round trip through a plain
 * JSON file and come back as real types rather than strings.
 *
 * GET  /api/admin/backup          -> every collection as one JSON download
 * GET  /api/admin/backup/summary  -> latest operation, recent history, totals
 * POST /api/admin/backup/import   -> replace all data from an uploaded JSON file
 */

// EJSON comes out of mongoose, so this needs no dependency of its own.
const { EJSON } = mongoose.mongo.BSON;

const BACKUP_LOG_COLLECTION = BackupLog.collection.name;

// How long a download stays valid as the pre-restore safety copy.
const SAFETY_BACKUP_WINDOW_MS = 10 * 60 * 1000;

// How many operations the history table shows.
const HISTORY_LIMIT = 10;

// "2026-09-26T14-05-00-000Z" — safe for every filesystem.
const stamp = (date = new Date()) => date.toISOString().replace(/[:.]/g, '-');

// The one place documents are turned into text. The export writes this exact
// string into the file, the fingerprints hash it, and the restore re-serialises
// the uploaded file with it, so those three can never drift apart.
const serialize = (document) => EJSON.stringify(document);

/**
 * Reads a collection once, keeping a running SHA-256 of everything it yields.
 *
 * The hash is the fingerprint used to decide whether data changed since the
 * admin's download. Counts alone cannot tell an edit from an unchanged
 * collection, so a same-size edit would slip through; hashing the actual
 * contents catches it.
 *
 * `onDocument` is called with each serialised document, which is how the
 * download streams the file without ever holding the collection in memory.
 */
const scanCollection = async (name, onDocument) => {
  const hash = crypto.createHash('sha256');
  let count = 0;

  for await (const document of mongoose.connection.db.collection(name).find({})) {
    const json = serialize(document);
    hash.update(json);
    hash.update('\n');
    count += 1;
    if (onDocument) await onDocument(json);
  }

  return { count, hash: hash.digest('hex') };
};

// Lists every collection that belongs in a backup. Nothing is hard-coded: the
// database is asked what it holds, so a collection added later is picked up on
// the next download without any code change. Only counts are read here, no
// documents, so this stays cheap on a large database. `backuplogs` is left out:
// it records the backup process itself, it is not site data, and it must
// survive a restore.
const listData = async () => {
  const existing = await mongoose.connection.db.listCollections().toArray();
  const names = existing
    .map((collection) => collection.name)
    .filter((name) => !name.startsWith('system.') && name !== BACKUP_LOG_COLLECTION)
    // Sorted so the same database always produces the same file layout.
    .sort();

  const counts = {};
  for (const name of names) {
    counts[name] = await mongoose.connection.db.collection(name).countDocuments({});
  }

  return { names, counts };
};

// Order-independent comparison, so it does not matter how Mongo stored the keys.
const sameRecord = (a, b) => {
  const keys = [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].sort();

  return keys.every((key) => (a || {})[key] === (b || {})[key]);
};

/**
 * Checks the current deployment for transaction support, once, then remembers
 * the answer. A replica set (or a mongos) can run the whole restore inside a
 * transaction so it either fully applies or not at all; a standalone mongod
 * cannot, and there the collections are written one after another.
 */
let transactionsPromise;

const supportsTransactions = async () => {
  if (!transactionsPromise) {
    transactionsPromise = mongoose.connection.db
      .admin()
      .command({ hello: 1 })
      .then((info) => Boolean(info.setName) || info.msg === 'isdbgrid')
      .catch(() => false);
  }

  return transactionsPromise;
};

/**
 * Runs `work` inside a transaction when the deployment supports one, otherwise
 * as-is. `work` receives a session, or null when transactions are unavailable.
 */
const withOptionalTransaction = async (work) => {
  if (!(await supportsTransactions())) {
    return { atomic: false, result: await work(null) };
  }

  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });

    return { atomic: true, result };
  } finally {
    await session.endSession();
  }
};

// Only one restore may run at a time. Two overlapping restores would interleave
// their deletes and inserts, and either one could end up half-applied.
let restoreInProgress = false;

/**
 * Writes the whole database to the response as one JSON document. Documents go
 * out as the cursor yields them and backpressure is respected, so memory stays
 * flat however large the database is.
 *
 * `meta` is written last, with the counts and hashes of what was actually
 * streamed, so the file can never contradict itself even if the database is
 * written to while the download is running.
 */
const streamSnapshot = async (res, names, generatedBy) => {
  const write = (chunk) =>
    new Promise((resolve) => (res.write(chunk) ? resolve() : res.once('drain', resolve)));

  const counts = {};
  const hashes = {};
  let totalDocuments = 0;

  await write('{"data":{');

  for (const [index, name] of names.entries()) {
    if (index > 0) await write(',');
    await write(`${JSON.stringify(name)}:[`);

    let first = true;
    const { count, hash } = await scanCollection(name, async (json) => {
      await write(first ? json : `,${json}`);
      first = false;
    });

    counts[name] = count;
    hashes[name] = hash;
    totalDocuments += count;

    await write(']');
  }

  const meta = {
    app: 'IEEE SHA website',
    version: 1,
    generatedAt: new Date().toISOString(),
    generatedBy,
    collections: names,
    totalDocuments,
    collectionCounts: counts,
    collectionHashes: hashes,
  };

  res.end(`},"meta":${JSON.stringify(meta)}}`);

  return { counts, hashes, totalDocuments };
};

const whoRan = (user) => ({
  performedBy: user?._id,
  performedByName: user?.name || '',
  performedByEmail: user?.email || '',
});

// Finds the most recent download this admin made. The browser starts restoring as
// soon as its download finishes, which can be a moment before the server's
// post-response log write lands, so give that write a moment to appear rather
// than turning a valid restore into an error.
const findRecentDownload = async (userId) => {
  const since = new Date(Date.now() - SAFETY_BACKUP_WINDOW_MS);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const download = await BackupLog.findOne({
      type: 'download',
      performedBy: userId,
      createdAt: { $gte: since },
    }).sort({ createdAt: -1 });

    if (download) return download;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
};

// Maps a collection name back to its Mongoose model, so restored documents get
// cast by the schema as well as by EJSON (keeps refs as ObjectIds).
const modelForCollection = (collectionName) => {
  const modelName = mongoose.modelNames().find(
    (name) => mongoose.model(name).collection.name === collectionName
  );
  return modelName ? mongoose.model(modelName) : null;
};

// Streams a full snapshot to the admin's device and records the operation.
const sendSnapshot = async (req, res) => {
  const { names } = await listData();
  // The name is only ever used by the browser to save the file; it is not stored.
  const filename = `ieee-backup-${stamp()}.json`;

  // The log is written only once the whole file has actually reached the client.
  // Recording it earlier would leave a phantom entry behind whenever a download
  // is cancelled or the connection drops part-way through.
  let delivered = false;
  const settled = new Promise((resolve) => {
    res.on('finish', () => { delivered = true; resolve(); });
    res.on('close', resolve);
    res.on('error', resolve);
  });

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  let fingerprint = { counts: {}, hashes: {}, totalDocuments: 0 };

  try {
    fingerprint = await streamSnapshot(res, names, {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
    });
  } catch (err) {
    // The response is already partly written, so there is no status left to set.
    res.destroy(err);
  }

  await settled;

  if (!delivered) return null;

  return await BackupLog.create({
    type: 'download',
    collections: names,
    totalDocuments: fingerprint.totalDocuments,
    fingerprint: { counts: fingerprint.counts, hashes: fingerprint.hashes },
    ...whoRan(req.user),
  });
};

// @desc Download every collection as a single JSON file
// @route GET /api/admin/backup
const downloadBackup = catchAsync(async (req, res) => {
  await sendSnapshot(req, res);
});

// @desc The most recent operation, recent history, and lifetime totals
// @route GET /api/admin/backup/summary
const getBackupSummary = catchAsync(async (req, res) => {
  const [lastBackup, history, totalOperations, totalDocuments, downloads, restores] =
    await Promise.all([
      BackupLog.findOne().sort({ createdAt: -1 }),
      BackupLog.find().sort({ createdAt: -1 }).limit(HISTORY_LIMIT),
      BackupLog.countDocuments(),
      BackupLog.aggregate([
        { $group: { _id: null, total: { $sum: '$totalDocuments' } } },
      ]),
      BackupLog.countDocuments({ type: 'download' }),
      BackupLog.countDocuments({ type: 'restore' }),
    ]);

  res.status(200).json({
    success: true,
    lastBackup,
    history,
    totals: {
      operations: totalOperations,
      documents: totalDocuments[0]?.total || 0,
      downloads,
      restores,
    },
  });
});

/**
 * Hashes documents the way scanCollection hashes a live collection, so a file's
 * recorded checksum and a fresh database scan are directly comparable.
 */
const hashDocuments = (documents) => {
  const hash = crypto.createHash('sha256');
  for (const document of documents) {
    hash.update(serialize(document));
    hash.update('\n');
  }
  return hash.digest('hex');
};

/**
 * Confirms the uploaded file matches the checksums it carries. A truncated,
 * altered or hand-edited file is caught here, before anything is deleted, rather
 * than part-way through a restore. Files without checksums (older backups) are
 * accepted as-is.
 */
const verifyFileIntegrity = (data, meta) => {
  if (!meta || typeof meta !== 'object' || !meta.collectionHashes) return;

  for (const [name, expected] of Object.entries(meta.collectionHashes)) {
    if (!Array.isArray(data[name])) continue;
    if (hashDocuments(data[name]) !== expected) {
      throw new AppError(
        `The backup file is damaged: the contents of "${name}" do not match the checksum recorded when it was created.`,
        400
      );
    }
  }

  if (typeof meta.totalDocuments === 'number') {
    const actual = Object.values(data)
      .filter(Array.isArray)
      .reduce((sum, documents) => sum + documents.length, 0);

    if (actual !== meta.totalDocuments) {
      throw new AppError(
        `The backup file is incomplete: it holds ${actual} documents but its metadata claims ${meta.totalDocuments}.`,
        400
      );
    }
  }
};

// @desc Replace all data with the contents of an uploaded backup file
// @route POST /api/admin/backup/import
const importBackup = catchAsync(async (req, res) => {
  // Only the request that actually takes the lock may release it, so a rejected
  // request cannot hand the lock back while someone else is still using it.
  let holdingLock = false;

  // The uploaded file is a temp copy on disk; remove it on every exit path.
  try {
    if (!req.file) throw new AppError('No backup file was uploaded', 400);

    if (restoreInProgress) {
      throw new AppError(
        'Another restore is already running. Wait for it to finish before starting another.',
        409
      );
    }

    // Taken before the checks below, not just around the writes: two restores
    // verifying at the same time would both pass the gate against the same
    // unchanged database and then apply on top of each other.
    restoreInProgress = true;
    holdingLock = true;

    // A restore is only allowed if this admin downloaded a copy recently, so
    // there is always a current copy of the data in their hands.
    const download = await findRecentDownload(req.user._id);
    if (!download) {
      throw new AppError(
        'Download a safety backup of the current data before restoring.',
        400
      );
    }

    // Confirm nothing has changed since that download, so the copy on the
    // admin's device really is a copy of what is about to be replaced. Checked
    // before the file is parsed so a stale download fails immediately.
    const { names, counts } = await listData();
    if (!sameRecord(download.fingerprint?.counts ?? download.fingerprint, counts)) {
      throw new AppError(
        'The data changed after that backup was downloaded, so it is no longer a safe copy. Download a fresh safety backup and try again.',
        409
      );
    }

    // The stored hashes cover the database, not the file, so the file itself is
    // what has to match: compare each collection the admin's download recorded
    // against a fresh scan of the live database.
    if (download.fingerprint?.hashes) {
      const live = {};
      for (const name of names) {
        live[name] = (await scanCollection(name)).hash;
      }
      if (!sameRecord(download.fingerprint.hashes, live)) {
        throw new AppError(
          'The data changed after that backup was downloaded, so it is no longer a safe copy. Download a fresh safety backup and try again.',
          409
        );
      }
    }

    let backup;
    try {
      backup = JSON.parse(await fs.readFile(req.file.path, 'utf8'));
    } catch {
      throw new AppError('That file is not valid JSON', 400);
    }

    if (!backup || typeof backup !== 'object' || Array.isArray(backup) ||
        !backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) {
      throw new AppError('That file is not a valid IEEE backup file', 400);
    }

    // Check the whole file over before anything is written or deleted.
    const entries = Object.entries(backup.data).map(([name, documents]) => {
      if (name.startsWith('system.')) {
        throw new AppError(`Refusing to restore the reserved collection "${name}"`, 400);
      }
      if (!Array.isArray(documents)) {
        throw new AppError(`"${name}" in the backup file is not a list of documents`, 400);
      }
      return { name, documents };
    });

    if (entries.length === 0) {
      throw new AppError('That backup file does not contain any collections', 400);
    }

    verifyFileIntegrity(backup.data, backup.meta);

    // EJSON restores the BSON types (dates, ObjectIds, binary) that a plain
    // JSON.parse would have flattened into strings.
    const restored = [];

    restoreInProgress = true;
    try {
      await withOptionalTransaction(async (session) => {
        for (const { name, documents } of entries) {
          // Never let a crafted file wipe the backup log.
          if (name === BACKUP_LOG_COLLECTION) continue;

          const Model = modelForCollection(name);
          const options = session ? { session } : {};

          if (Model) {
            await Model.collection.deleteMany({}, options);
            if (documents.length > 0) {
              // No validation: a restore should not rewrite what was backed up.
              await Model.insertMany(
                EJSON.parse(JSON.stringify(documents), { relaxed: true }),
                { ...options, validateBeforeSave: false, ordered: true }
              );
            }
          } else {
            const target = mongoose.connection.db.collection(name);
            await target.deleteMany({}, options);
            if (documents.length > 0) {
              await target.insertMany(
                EJSON.parse(JSON.stringify(documents), { relaxed: true }),
                { ...options, ordered: true }
              );
            }
          }

          restored.push({ collection: name, documents: documents.length });
        }
      });
    } catch (err) {
      throw new AppError(
        `Restore failed part-way through (${err.message}). The safety backup you just downloaded holds the previous data.`,
        500
      );
    }

    const totalDocuments = restored.reduce((sum, entry) => sum + entry.documents, 0);
    const atomic = await supportsTransactions();

    await BackupLog.create({
      type: 'restore',
      collections: restored.map((entry) => entry.collection),
      totalDocuments,
      // No fingerprint here: the gate only ever reads one from a download, and
      // on this entry it would describe the data as it was *before* the restore.
      ...whoRan(req.user),
    });

    const restoredWhat = `Restored ${totalDocuments} document${totalDocuments === 1 ? '' : 's'} across ${restored.length} collection${restored.length === 1 ? '' : 's'}.`;

    res.status(200).json({
      success: true,
      // On a replica set the whole restore either applied or left nothing
      // behind. A standalone mongod cannot do that, so say so rather than let
      // the admin assume they are safe from a half-applied restore.
      message: atomic
        ? `${restoredWhat} It was applied as a single transaction, so it either completed fully or changed nothing.`
        : `${restoredWhat} This server cannot apply a restore as a transaction, so an interrupted restore would leave data partly replaced — the safety backup is the way back.`,
      restored,
      atomic,
    });
  } finally {
    if (holdingLock) restoreInProgress = false;
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
  }
});

module.exports = {
  downloadBackup,
  getBackupSummary,
  importBackup,
};
