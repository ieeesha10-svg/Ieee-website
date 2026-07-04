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

  // speakers come as a JSON string from FormData
  let parsedSpeakers = [];
  if (speakers) {
    try {
      parsedSpeakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers;
    } catch { parsedSpeakers = []; }
  }

  // Map uploaded images to speakers by index
  if (req.files && req.files.length > 0) {
    req.files.forEach((file, i) => {
      if (parsedSpeakers[i]) {
        parsedSpeakers[i].image = `/uploads/speakers/${file.filename}`;
      }
    });
  }

  const activity = await Activity.create({
    title,
    content,
    type,
    speakers: parsedSpeakers,
    location,
    registrationEnabled: registrationEnabled !== "false",
  });

  // default form fields for event/workshop
  if (!fields) {
    fields = [
      { id: "name", label: "Name", type: "TextInput", required: true },
      { id: "email", label: "Email", type: "TextInput", required: true }
    ];
  }
  if (!startDate) startDate = new Date();
  if (!endDate) endDate = new Date((activity.createdAt || Date.now()) + 6.5 * 24 * 60 * 60 * 1000);

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
    location: activity.location,
    registrationEnabled: activity.registrationEnabled
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
  const { title, content, type, speakers, location, registrationEnabled, startDate, endDate, maxSubmissions } = req.body;

  const activity = await Activity.findById(req.params.id);
  if (!activity) throw new AppError("Activity not found", 404);

  // Update activity fields if provided
  if (title != null) activity.title = title;
  if (content != null) activity.content = content;
  if (type != null) activity.type = type;
  if (location != null) activity.location = location;
  if (registrationEnabled != null) activity.registrationEnabled = registrationEnabled === "true" || registrationEnabled === true;

  // Parse and update speakers
  if (speakers != null) {
    let parsedSpeakers = [];
    try { parsedSpeakers = typeof speakers === 'string' ? JSON.parse(speakers) : speakers; } catch { parsedSpeakers = []; }

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, i) => {
        if (parsedSpeakers[i]) {
          parsedSpeakers[i].image = `/uploads/speakers/${file.filename}`;
        }
      });
    }

    // Keep existing images for speakers that weren't replaced
    parsedSpeakers = parsedSpeakers.map((s, i) => {
      if (!s.image && activity.speakers[i]?.image) {
        s.image = activity.speakers[i].image;
      }
      return s;
    });

    activity.speakers = parsedSpeakers;
  }

  await activity.save();

  // Update associated form if date/submission fields provided
  const form = await Form.findOne({ activityID: activity._id });
  if (form) {
    if (startDate != null) form.startDate = startDate;
    if (endDate != null) form.endDate = endDate;
    if (maxSubmissions != null && maxSubmissions !== "") form.maxSubmissions = Number(maxSubmissions);
    await form.save();
  }

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