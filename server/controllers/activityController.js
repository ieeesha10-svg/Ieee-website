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
  if (!startDate) startDate = new Date();
  if (!endDate) endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const activity = await Activity.create({
    title,
    content,
    type,
    speakers: activitySpeakers,
    location,
    startDate,
    endDate,
  });

  if (!fields) {
    fields = [
      { id: "name", label: "Name", type: "TextInput", required: true },
      { id: "email", label: "Email", type: "TextInput", required: true }
    ];
  }
  // Create associated form
  const form = await Form.create({
    title: `${activity.title} Registration Form`,
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
  // pagination feature
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const numberOfActivities = activities.length;
  const paginatedActivities = activities.slice(skip, skip + limit);

  const formattedActivities = await Promise.all(
    paginatedActivities.map(async (activity) => {
      const form = await Form.findOne({ activityID: activity._id });
      return {
        _id: activity._id,
        title: activity.title,
        content: activity.content,
        type: activity.type,
        speakers: activity.speakers,
        location: activity.location,
        startDate: activity.startDate,
        endDate: activity.endDate,
        createdAt: activity.createdAt,
        status: form ? form.status : "No Form Found" 
      };
    })
  );

  res.json({ 
    success: true, 
    pagination: {
      totalItems: numberOfActivities,
      totalPages: Math.ceil(numberOfActivities / limit),
      currentPage: page,
      itemsPerPage: limit
    },
    activities: formattedActivities
  });
});

const getActivityById = catchAsync(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) throw new AppError("Activity not found", 404);
  // Also fetch associated form
  const form = await Form.findOne({ activityID: activity._id });
  res.json({ success: true, activity, form });
});

const updateActivity = catchAsync(async (req, res) => {
  const activity = await Activity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!activity) throw new AppError("Activity not found", 404);

  if (req.body.fields || req.body.startDate || req.body.endDate || req.body.maxSubmissions) {
    const formUpdates = {};
    if (req.body.fields) formUpdates.fields = req.body.fields;
    if (req.body.startDate) formUpdates.startDate = req.body.startDate;
    if (req.body.endDate) formUpdates.endDate = req.body.endDate;
    if (req.body.maxSubmissions !== undefined) formUpdates.maxSubmissions = req.body.maxSubmissions;

    await Form.findOneAndUpdate(
      { activityID: activity._id },
      formUpdates,
      { new: true }
    );
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