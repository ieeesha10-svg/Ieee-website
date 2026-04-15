const Form = require('../models/FormModel');

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private (Admin)
const createForm = async (req, res) => {
  try {
    const { title, description, structure, type, settings } = req.body;

    const form = await Form.create({
      title,
      description,
      structure, // The JSON array from frontend
      type,
      settings,
      createdBy: req.user._id // Taken from the 'protect' middleware
    });

    res.status(201).json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single form by ID (Public view for students)
// @route   GET /api/forms/:id
// @access  Public
const getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if form is Active
    if (!form.settings.isActive) {
      return res.status(400).json({ message: 'This form is currently closed.' });
    }

    // Check Expiry Date
    if (form.settings.expiryDate && new Date() > new Date(form.settings.expiryDate)) {
      return res.status(400).json({ message: 'This form has expired.' });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get ALL forms (For Admin Dashboard Table)
// @route   GET /api/forms
// @access  Private (Admin)
const getForms = async (req, res) => {
  try {
    // Sort by newest first
    const forms = await Form.find({}).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private (Admin)
const deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Optional: Check if the user is the one who created it OR is a super admin
    // if (form.createdBy.toString() !== req.user._id.toString()) ...

    await form.deleteOne();
    res.json({ message: 'Form removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Form Status (Open/Close manually)
// @route   PUT /api/forms/:id/toggle
// @access  Private (Admin)
const toggleFormStatus = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    form.settings.isActive = !form.settings.isActive;
    await form.save();

    res.json({ message: `Form is now ${form.settings.isActive ? 'Active' : 'Closed'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createForm, 
  getForm, 
  getForms, 
  deleteForm,
  toggleFormStatus 
};