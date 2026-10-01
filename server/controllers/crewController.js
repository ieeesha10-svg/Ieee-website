const mongoose = require("mongoose");
const Crew = require("../models/crewModel");
const Season = require("../models/seasonModel");
const {
  sanitizeSocials,
  shapeMember,
  SECTIONS,
} = require("../utils/crewUtils");
const { catchAsync, AppError } = require("../middleware/errorsMiddleware");

// Every route here is behind protect + authorize(...WRITE_ROLES) except the
// GET, so the write handlers do not re-check roles.

// Mongoose 9 exposes isValidObjectId on the module, not on the model.
const isObjectId = (id) => mongoose.isValidObjectId(id);

/**
 * Validate the season a member is being filed under.
 *
 * Checked rather than trusted because `season` is a raw ObjectId cast by
 * Mongoose: a syntactically valid id pointing at a deleted season would
 * otherwise create a member invisible to every page, with no error anywhere.
 */
const assertSeasonExists = async (seasonId) => {
  if (!seasonId) {
    throw new AppError("A crew member must belong to a season", 400);
  }
  if (!isObjectId(seasonId)) {
    throw new AppError("Invalid season id", 400);
  }
  if (!(await Season.exists({ _id: seasonId }))) {
    throw new AppError("That season does not exist", 400);
  }
  return seasonId;
};

const assertSection = (section) => {
  if (!SECTIONS.includes(section)) {
    // Built from the list rather than written out, so adding a section cannot
    // leave this message naming a set that no longer matches the enum.
    throw new AppError(
      `Section must be one of ${SECTIONS.map((s) => `"${s}"`).join(", ")}`,
      400
    );
  }
  return section;
};

// Pull the writable fields out of the request body, dropping anything else, so a
// crafted body cannot set createdAt or _id through this endpoint.
const readMemberInput = (body) => ({
  name: (body?.name || "").trim(),
  position: (body?.position || "").trim(),
  image: (body?.image || "").trim(),
  bio: (body?.bio || "").trim(),
  order: Number.isFinite(body?.order) ? Number(body.order) : 0,
});

// @desc CREATE crew member
// @route POST /api/crew
const createCrew = catchAsync(async (req, res) => {
  const input = readMemberInput(req.body);

  if (!input.name) throw new AppError("Name is required", 400);
  if (!input.position) throw new AppError("Position is required", 400);

  const season = await assertSeasonExists(req.body?.season);
  const section = assertSection(req.body?.section);
  const socials = sanitizeSocials(req.body?.socials, AppError);

  const crew = await Crew.create({ ...input, season, section, socials });

  res.status(201).json({
    success: true,
    data: shapeMember(crew),
  });
});

// @desc GET crew members
// @route GET /api/crew?season=<id>
//
// With no `season` this returns every member, which is what the dashboard's
// season-less callers and ad-hoc queries want. The public pages always pass one,
// so a visitor never sees the whole archive on one page.
const getAllCrew = catchAsync(async (req, res) => {
  const filter = {};

  if (req.query.season) {
    if (!isObjectId(req.query.season)) {
      throw new AppError("Invalid season id", 400);
    }
    filter.season = req.query.season;
  }

  if (req.query.section) {
    filter.section = assertSection(req.query.section);
  }

  const crew = await Crew.find(filter)
    .sort({ season: -1, section: 1, order: 1, createdAt: 1 })
    .lean();

  res.status(200).json({
    success: true,
    results: crew.length,
    data: crew.map(shapeMember),
  });
});

// @desc UPDATE crew member
// @route PUT /api/crew/:id
const updateCrew = catchAsync(async (req, res) => {
  if (!isObjectId(req.params.id)) {
    throw new AppError("Invalid crew member id", 400);
  }

  const existing = await Crew.findById(req.params.id);
  if (!existing) {
    throw new AppError("Crew member not found", 404);
  }

  // Only the fields present in the body are touched, so a PATCH-style update
  // that omits `bio` does not blank the bio someone already wrote.
  const input = readMemberInput({
    name: req.body?.name ?? existing.name,
    position: req.body?.position ?? existing.position,
    image: req.body?.image ?? existing.image,
    bio: req.body?.bio ?? existing.bio,
    order: req.body?.order ?? existing.order,
  });

  if (!input.name) throw new AppError("Name is required", 400);
  if (!input.position) throw new AppError("Position is required", 400);

  if (req.body?.season !== undefined) {
    input.season = await assertSeasonExists(req.body.season);
  }
  if (req.body?.section !== undefined) {
    input.section = assertSection(req.body.section);
  }
  if (req.body?.socials !== undefined) {
    input.socials = sanitizeSocials(req.body.socials, AppError);
  }

  const crew = await Crew.findByIdAndUpdate(
    req.params.id,
    input,
    {
      // `returnDocument` rather than the older `new: true`, which mongoose 9
      // deprecates and warns about on every single call.
      returnDocument: 'after',
      runValidators: true,
    }
  );

  if (!crew) {
    throw new AppError("Crew member not found", 404);
  }

  res.status(200).json({
    success: true,
    data: shapeMember(crew),
  });
});

// @desc DELETE crew member
// @route DELETE /api/crew/:id
const deleteCrew = catchAsync(async (req, res) => {
  if (!isObjectId(req.params.id)) {
    throw new AppError("Invalid crew member id", 400);
  }

  const crew = await Crew.findByIdAndDelete(req.params.id);
  if (!crew) {
    throw new AppError("Crew member not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Crew member deleted successfully",
  });
});

module.exports = {
  createCrew,
  getAllCrew,
  updateCrew,
  deleteCrew,
  SECTIONS,
};
