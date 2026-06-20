const Crew = require("../models/crewModel");
const { catchAsync, AppError } = require("../middleware/errorsMiddleware");

// only xcom and board can access these routes, so no need for role checks here as they are handled in the auth middleware
// @desc CREATE crew member
// @route POST /api/crew
const createCrew = catchAsync(async (req, res) => {
  const crew = await Crew.create(req.body);

  res.status(201).json({
    success: true,
    data: crew,
  });
});


// @desc GET all crew members
// @route GET /api/crew
const getAllCrew = catchAsync(async (req, res) => {
  const crew = await Crew.find();

  res.status(200).json({
    success: true,
    results: crew.length,
    data: crew,
  });
});

// @desc UPDATE crew member
// @route PUT /api/crew/:id
const updateCrew = catchAsync(async (req, res) => {
  const crew = await Crew.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!crew) {
    throw new AppError('Crew member not found', 404);
  }

  res.status(200).json({
    success: true,
    data: crew,
  });
});


// @desc DELETE crew member
// @route DELETE /api/crew/:id
const deleteCrew = catchAsync(async (req, res) => {
  const crew = await Crew.findByIdAndDelete(req.params.id);

  if (!crew) {
    throw new AppError('Crew member not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Crew member deleted successfully',
  });
});

module.exports = {
  createCrew,
  getAllCrew,
  updateCrew,
  deleteCrew,
};