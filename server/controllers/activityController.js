const { catchAsync, AppError } = require('../middleware/errorsMiddleware.js');
const Activity = require('../models/ActivityModel.js');
const Form = require('../models/FormModel.js');
const Submission = require('../models/SubmissionModel.js');
const cloudinary = require('../config/cloudinary.js');
const sanitizeHtml = require('sanitize-html');
/**
 >> each activity has a form associated with it. <<

 * POST    /api/activities --> create a new activity      (createActivity)
 * GET     /api/activities --> get all activities         (getActivities)
 * GET     /api/activities/:id --> get activity by id     (getActivityById)
 * PUT     /api/activities/:id --> update activity by id  (updateActivity)
 * DELETE  /api/activities/:id --> delete activity by id  (deleteActivity)
*/

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'activities' }, 
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const sanitizeHtmlOptions = {
  allowedTags: ["h1","h2","h3","p","b","i","em","strong","u","s","del","mark","ul","ol","li","a","br","hr","blockquote","code","pre","span"],
  allowedAttributes: {
    a: ["href","target","rel"],
    "*": ["class","style"],
  },
};

const createActivity = catchAsync(async (req, res) => {
  let { title, content, description, type, speakers, location, registrationEnabled, fields, startDate, endDate, maxSubmissions } = req.body;
  if(!title || !content || !location) {
    throw new AppError("Title, content, and location are required", 400);
  }
  content = sanitizeHtml(content, sanitizeHtmlOptions);
  const activitySpeakers = speakers || [];
  if (!startDate) startDate = new Date();
  if (!endDate) endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  coverImageUrl = "";
  let coverImagePublicId = "";
  if (req.file) {
    // console.log("TESTING : req.file:", req.file);
    const result = await uploadToCloudinary(req.file.buffer);
    coverImageUrl = result.secure_url;
    coverImagePublicId = result.public_id;
  }
  const activity = await Activity.create({
    title,
    content,
    description: description || "",
    type,
    speakers: activitySpeakers,
    location,
    startDate,
    endDate,
    coverImage: coverImageUrl || "",
    coverImagePublicId: coverImagePublicId || ""
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
        description: activity.description,
        type: activity.type,
        speakers: activity.speakers,
        location: activity.location,
        startDate: activity.startDate,
        endDate: activity.endDate,
        createdAt: activity.createdAt,
        coverImage: activity.coverImage || "",
        registrationEnabled: activity.registrationEnabled,
        status: form ? form.status : "No Form Found",
        formID: form ? form._id : null
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
  const existingActivity = await Activity.findById(req.params.id);
  if (!existingActivity) {
    throw new AppError("Activity not found", 404);
  }

  let updateData = { ...req.body };
  if (updateData.content) {
    updateData.content = sanitizeHtml(updateData.content, sanitizeHtmlOptions);
  }
  if(updateData.startDate && updateData.endDate && new Date(updateData.startDate) > new Date(updateData.endDate)) {
    throw new AppError("Start date cannot be after end date", 400);
  }
  if (req.body.coverImage === "" && existingActivity.coverImagePublicId) {
    await cloudinary.uploader.destroy(existingActivity.coverImagePublicId);
    updateData.coverImage = "";
    updateData.coverImagePublicId = "";
  }
  if (req.file) {
    if (existingActivity.coverImagePublicId) {
      await cloudinary.uploader.destroy(existingActivity.coverImagePublicId);
    }
    const result = await uploadToCloudinary(req.file.buffer);
    updateData.coverImage = result.secure_url;
    updateData.coverImagePublicId = result.public_id; 
  }

  const activity = await Activity.findByIdAndUpdate(
    req.params.id,
    updateData,
    { 
      returnDocument: 'after', 
      runValidators: true 
    }
  );

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