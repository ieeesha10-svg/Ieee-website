const Season = require("../models/seasonModel");
const Crew = require("../models/crewModel");
const { shapeMember } = require("../utils/crewUtils");
const { catchAsync, AppError } = require("../middleware/errorsMiddleware");

// Mongoose 9 exposes isValidObjectId on the module, not on the model, so this
// comes from `mongoose` rather than from `Season`.
const mongoose = require("mongoose");

// Ordered newest first. `order` is assigned on create from the current count,
// so this is a stable, admin-controlled order rather than creation time, and a
// season added years ago cannot jump ahead of a freshly archived one.
const sortNewestFirst = { order: -1, createdAt: -1 };

// Guard for a season id that is not a valid ObjectId. Without this, Mongoose
// throws a CastError that surfaces to the visitor as a 500 on a bad URL.
const assertObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid season id", 400);
  }
};

// The two public views of a season's members. Both return the same shape so the
// home page and /crew cannot drift apart, and so the archive page reuses
// getSeasonWithMembers instead of writing its own populate.
const membersOf = (seasonId) =>
  Crew.find({ season: seasonId }).sort({ section: 1, order: 1, createdAt: 1 }).lean();

const shapeSeason = (season) => ({
  _id: season._id,
  name: season.name,
  isHome: season.isHome,
  order: season.order,
  createdAt: season.createdAt,
  updatedAt: season.updatedAt,
});

// One place that turns a season's member list into the excom/board pair every
// caller of this controller returns, so the home page, /crew and the archive all
// agree on which members are in which section and in what order.
const withMembers = async (season) => {
  const members = await membersOf(season._id);
  return {
    season: shapeSeason(season),
    excom: members.filter((m) => m.section === "excom").map(shapeMember),
    board: members.filter((m) => m.section === "board").map(shapeMember),
  };
};

// @desc GET every season, with a headcount for the archive's season picker
// @route GET /api/seasons
const getSeasons = catchAsync(async (req, res) => {
  const seasons = await Season.find().sort(sortNewestFirst).lean();

  // One grouped count instead of a per-season query: the archive page lists all
  // of them, and N+1 countDocuments() calls would be the slowest thing on a
  // public page.
  const counts = await Crew.aggregate([
    { $group: { _id: "$season", total: { $sum: 1 } } },
  ]);
  const countBySeason = new Map(counts.map((c) => [String(c._id), c.total]));

  res.status(200).json({
    success: true,
    results: seasons.length,
    data: seasons.map((season) => ({
      ...shapeSeason(season),
      memberCount: countBySeason.get(String(season._id)) || 0,
    })),
  });
});

// @desc GET one season with its Excom and Board members
// @route GET /api/seasons/:id
const getSeasonById = catchAsync(async (req, res) => {
  assertObjectId(req.params.id);

  const season = await Season.findById(req.params.id).lean();
  if (!season) {
    throw new AppError("Season not found", 404);
  }

  res.status(200).json({
    success: true,
    data: await withMembers(season),
  });
});

// @desc GET the season published on the home page
// @route GET /api/seasons/home
//
// Deliberately 200 with `data: null` rather than 404. "No season has been
// published yet" is a normal state on a fresh install, and the home page should
// quietly render nothing instead of logging a failed request every visit.
const getHomeSeason = catchAsync(async (req, res) => {
  const season = await Season.findOne({ isHome: true }).sort(sortNewestFirst).lean();
  if (!season) {
    return res.status(200).json({ success: true, data: null });
  }

  res.status(200).json({
    success: true,
    data: await withMembers(season),
  });
});

// @desc CREATE a season
// @route POST /api/seasons
const createSeason = catchAsync(async (req, res) => {
  const name = (req.body?.name || "").trim();
  if (!name) {
    throw new AppError("Season name is required", 400);
  }

  if (await Season.exists({ name })) {
    throw new AppError(`A season named "${name}" already exists`, 400);
  }

  // Append to the bottom of the archive rather than the top, so creating the
  // season does not silently re-order the seasons already on the site.
  const count = await Season.countDocuments();

  const season = await Season.create({ name, order: count });

  res.status(201).json({
    success: true,
    data: shapeSeason(season),
  });
});

// @desc RENAME a season
// @route PUT /api/seasons/:id
const updateSeason = catchAsync(async (req, res) => {
  assertObjectId(req.params.id);

  const name = (req.body?.name || "").trim();
  if (!name) {
    throw new AppError("Season name is required", 400);
  }

  const clash = await Season.exists({ name, _id: { $ne: req.params.id } });
  if (clash) {
    throw new AppError(`A season named "${name}" already exists`, 400);
  }

  const season = await Season.findByIdAndUpdate(
    req.params.id,
    { name },
    { returnDocument: 'after', runValidators: true }
  );
  if (!season) {
    throw new AppError("Season not found", 404);
  }

  res.status(200).json({
    success: true,
    data: shapeSeason(season),
  });
});

// @desc Publish a season on the home page, and unpublish whichever one was
// @route PUT /api/seasons/:id/home
const setHomeSeason = catchAsync(async (req, res) => {
  assertObjectId(req.params.id);

  const season = await Season.findById(req.params.id);
  if (!season) {
    throw new AppError("Season not found", 404);
  }

  // Set the incoming season first, then clear the others. Doing it the other
  // way round leaves a window where no season is published and the home page
  // goes blank; this way the worst case is two published for a few
  // milliseconds, which renders the same as one.
  season.isHome = true;
  await season.save();
  await Season.updateMany(
    { _id: { $ne: season._id }, isHome: true },
    { $set: { isHome: false } }
  );

  res.status(200).json({
    success: true,
    data: shapeSeason(season),
  });
});

// @desc DELETE a season
// @route DELETE /api/seasons/:id
const deleteSeason = catchAsync(async (req, res) => {
  assertObjectId(req.params.id);

  const season = await Season.findById(req.params.id);
  if (!season) {
    throw new AppError("Season not found", 404);
  }

  // Refuse rather than cascade. Deleting a season is meant to tidy the archive
  // of seasons nobody filled in; silently deleting a season's people because the
  // button was next to its name would be a nasty surprise, so the admin is told
  // to empty it first.
  const memberCount = await Crew.countDocuments({ season: season._id });
  if (memberCount > 0) {
    throw new AppError(
      `This season still has ${memberCount} member${memberCount === 1 ? "" : "s"}. Remove them before deleting the season.`,
      400
    );
  }

  await season.deleteOne();

  res.status(200).json({
    success: true,
    message: "Season deleted successfully",
  });
});

module.exports = {
  getSeasons,
  getSeasonById,
  getHomeSeason,
  createSeason,
  updateSeason,
  setHomeSeason,
  deleteSeason,
};
