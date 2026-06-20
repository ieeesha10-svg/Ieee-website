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

    form.settings.isActive = !form.settings.isActive;
    await form.save();

    res.json({ message: `Form is now ${form.settings.isActive ? 'Active' : 'Closed'}` });
});

module.exports = { 
  createForm, 
  getForm, 
  getForms, 
  deleteForm,
  toggleFormStatus 
};