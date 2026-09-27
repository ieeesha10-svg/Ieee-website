const { catchAsync, AppError } = require('../middleware/errorsMiddleware');
const Form = require('../models/FormModel');
const { deriveFieldIds, describeFieldIdProblems } = require('../utils/fieldId');

/**
 * Reject a field list that cannot produce usable, unique answer keys.
 *
 * Field ids are derived from labels (see utils/fieldId.js) and are what every
 * answer is stored under, so a label that slugs to nothing, or two labels that
 * slug to the same id, has to be refused up front. Previously these were only
 * caught deep inside Mongoose as a generic 500.
 *
 * @param {Array} fields
 */
function assertUsableFieldIds(fields) {
  const { emptyLabels, duplicates } = deriveFieldIds(fields);
  if (emptyLabels.length === 0 && duplicates.length === 0) return;

  throw new AppError(describeFieldIdProblems({ emptyLabels, duplicates }), 400, 'INVALID_FIELD_IDS');
}

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private (Admin)
const createForm = catchAsync(async (req, res) => {
  const { title, description, fields, type, startDate, endDate, maxSubmissions } = req.body;

  if (!title || !type) {
    throw new AppError("Title and Type are required", 400);
  }

  // Check the type against the schema's own enum so there is a single source of
  // truth. Without this an unsupported type only fails later inside Mongoose and
  // surfaces as an opaque 500.
  const allowedTypes = Form.schema.path('type').enumValues;
  if (!allowedTypes.includes(type)) {
    throw new AppError(
      `"${type}" is not a valid form type. Expected one of: ${allowedTypes.join(', ')}.`,
      400,
      'INVALID_FORM_TYPE'
    );
  }

  // A form with no fields is never intentional and cannot be submitted
  // (submitForm requires a name field), so say so rather than silently
  // substituting a default. `fields` being absent entirely still falls back to
  // the default below, which keeps older clients working.
  if (fields !== undefined && (!Array.isArray(fields) || fields.length === 0)) {
    throw new AppError("A form needs at least one field", 400, 'NO_FIELDS');
  }

  const resolvedFields = fields || [
    {
      label: "Full Name",
      type: "TextInput",
      required: true
    }
  ];

  assertUsableFieldIds(resolvedFields);

  const defaultstartDate = new Date();
  const defaultendDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now
  const form = await Form.create({
    title,
    description,
    fields: resolvedFields,
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
    if (new Date(form.endDate).setHours(23,59,59,999) < new Date() || form.status !== "Active") {
      throw new AppError('This form is currently closed.', 400);
    }

    res.json(form);
});

// @desc    Get ALL forms (For Admin Dashboard Table)
// @route   GET /api/form/all
// @access  Private (Admin)
const getForms = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sort by newest first
  const [result] = await Form.aggregate([
    {
      $facet: {
        forms: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
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
  
  res.json({
    count,
    draftCount,
    closedCount,
    activeCount,
    forms,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      itemsPerPage: limit,
    },
  });
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
        returnDocument: 'after',
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
== known gaps (see the repo analysis) ==

`updateFormSettings` below wraps its own body in a try/catch that converts
everything — including the 404 it raises — into a 500, and only checks
startDate-before-endDate when both arrive in the same request. Both are still
open.

`requiresLogin` is still never read from `req.body` in `createForm`, and no
builder UI exposes it, so the flag is effectively always false.

`activityID` is not marked unique in FormModel, so forms created without one
are fine today — the concern in the original review does not apply.
*/
