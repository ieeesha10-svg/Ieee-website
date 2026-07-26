const { catchAsync, AppError } = require('../middleware/errorsMiddleware');
const Form = require('../models/FormModel');

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private (Admin)
const createForm = catchAsync(async (req, res) => {
  const { title, description, fields, type, startDate, endDate, maxSubmissions } = req.body;

  if (!title || !type) {
    throw new AppError("Title and Type are required", 400);
  }

  const defaultFields = [
    {
      id: "full_name",
      label: "Full Name",
      type: "text",
      required: true
    }
  ];
  const defaultstartDate = new Date();
  const defaultendDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now
  const form = await Form.create({
    title,
    description,
    fields: fields || defaultFields,
    type,
    startDate: startDate || defaultstartDate,
    endDate: endDate || defaultendDate,
    maxSubmissions,
    createdBy: req.user._id
  });

  res.status(201).json(form);
});

// @desc    Get a single form by ID (Public view for students)
// @route   GET /api/form/:id
// @access  Public
const getForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id);

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    // Check if form is Active
    if (form.endDate < new Date() || form.status !== "Active") {
      throw new AppError('This form is currently closed.', 400);
    }

    res.json(form);
});

// @desc    Get ALL forms (For Admin Dashboard Table)
// @route   GET /api/form/all
// @access  Private (Admin)
const getForms = catchAsync(async (req, res) => {
  // Sort by newest first
  const [result] = await Form.aggregate([
    {
      $facet: {
        forms: [
          { $sort: { createdAt: -1 } }
        ],

        totalCount: [
          { $count: "count" }
        ],

        draftCount: [
          { $match: { status: "Draft" } },
          { $count: "count" }
        ],

        closedCount: [
          { $match: { status: "Closed" } },
          { $count: "count" }
        ],

        activeCount: [
          { $match: { status: "Active" } },
          { $count: "count" }
        ]
      }
    }
  ]);

  const forms = result.forms;
  const count = result.totalCount[0]?.count || 0;
  const draftCount = result.draftCount[0]?.count || 0;
  const closedCount = result.closedCount[0]?.count || 0;
  const activeCount = result.activeCount[0]?.count || 0;
  
  res.json({ count, draftCount, closedCount, activeCount, forms });
});

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private (Admin)
const deleteForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id);

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    // Optional: Check if the user is the one who created it OR is a super admin
    // if (form.createdBy.toString() !== req.user._id.toString()) ...

    await form.deleteOne();
    res.json({ message: 'Form removed' });
});

// @desc    Toggle Form Status (Open/Close manually)
// @route   PUT /api/forms/:id/toggle
// @access  Private (Admin)
const toggleFormStatus = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id);
    if (!form) throw new AppError('Form not found', 404);

    form.status = form.status === 'Active' ? 'Closed' : 'Active';
    await form.save();

    res.json({ message: `Form is now ${form.status}` });
});

const updateFormSettings = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, maxSubmissions } = req.body;

    const updateFields = {};
    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    if (maxSubmissions !== undefined) updateFields.maxSubmissions = maxSubmissions;

    if (updateFields.startDate && updateFields.endDate) {
      if (new Date(updateFields.startDate) > new Date(updateFields.endDate)) {
        return res.status(400).json({ message: "startDate must be before endDate" });
      }
    }

    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedForm) {
      throw new AppError("Form not found", 404);
    }

    res.status(200).json({
      message: "Form settings updated successfully",
      form: updatedForm
    });

  } catch (error) {
    // console.error("Error updating form settings:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

module.exports = { 
  createForm, 
  getForm, 
  getForms, 
  deleteForm,
  toggleFormStatus,
  updateFormSettings
};

/*
== points to consider for improvement ==

There's a problem with the `toggleFormStatus` function: You're changing `form.settings.isActive`, but in the `formSchema` you sent, there is no object named `settings`. The field responsible for the status in the schema is `status`, and its values are strings (“Active”, ‘Closed’, “Draft”).

The `requiresLogin` field: You added this field to the `formSchema`, but in the `createForm` function (the controller), you are not retrieving it from `req.body` or saving it.

The `activityID` field in the schema: You defined it as `unique: true`. If you create multiple forms without linking them to an `activityID` (i.e., its value is `null`), the database (MongoDB) may refuse to create the second form due to a `Duplicate Key` error on the `null` value.
*/