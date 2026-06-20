const { catchAsync, AppError } = require('../middleware/errorsMiddleware.js');
const Activity = require('../models/ActivityModel.js');
const Form = require('../models/FormModel.js');
const Submission = require('../models/SubmissionModel.js');

/**
 >> each activity has a form associated with it. <<

 * POST    /api/activities --> create a new activity      (createActivity)
 * GET     /api/activities --> get all activities         (getActivities)
 * GET     /api/activities/:id --> get activity by id     (getActivityById)
 * PUT     /api/activities/:id --> update activity by id  (updateActivity)
 * DELETE  /api/activities/:id --> delete activity by id  (deleteActivity)
*/

const createActivity = catchAsync(async (req, res) => {
  let { title, content, type, speakers, location, registrationEnabled, fields, startDate, endDate, maxSubmissions } = req.body;
  if(!title || !content || !location) {
    throw new AppError("Title, content, and location are required", 400);
  }
  const activitySpeakers = speakers || [];
  const activity = await Activity.create({
    title,
    content,
    type, // default is "general" as per schema
    speakers: activitySpeakers,
    location,
    // registrationEnabled: isRegistrationEnabled
  });

  // default form fields for event/workshop
  if (!fields) {
    fields = [
      { id: "name", label: "Name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true }
    ];
  }
  // default form date range: registration opens now, closes 1 day before event
  if (!startDate) startDate = new Date();
  if (!endDate) endDate = new Date((activity.createdAt || Date.now()) + 6.5 * 24 * 60 * 60 * 1000);
  // Create associated form
  const form = await Form.create({
    activityID: activity._id,
    createdBy: req.user._id,
    fields,
    startDate,
    endDate,
    maxSubmissions
  });

  res.status(201).json({ success: true, message: "Activity created with associated form",  activity, form });
});

const getActivities = catchAsync(async (req, res) => {
  const activities = await Activity.find();
  const numberOfActivities = activities.length;
  res.json({ success: true, length: numberOfActivities, activities : activities.map(activity => ({
    _id: activity._id,
    title: activity.title,
    content: activity.content,
    type: activity.type,
    speakers: activity.speakers,
    location: activity.location
  })) });
});

const getActivityById = catchAsync(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) throw new AppError("Activity not found", 404);
  // Also fetch associated form
  const form = await Form.findOne({ activityID: activity._id });
  res.json({ success: true, activity, form });
});

const updateActivity = catchAsync(async (req, res) => {
  // if inputs are not provided, they will be ignored and not updated
  const activity = await Activity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!activity) throw new AppError("Activity not found", 404);
  res.json({ success: true, activity });
});

// Delete activity + related form + all related submissions
const deleteActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findByIdAndDelete(req.params.id);
  if (!activity) throw new AppError("Activity not found", 404);

  const form = await Form.findOneAndDelete({ activityID: activity._id });
  if (form) {
    await Submission.deleteMany({ formID: form._id });
  }

  res.json({ success: true, message: "Activity + related form + submissions deleted" });
});

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
};