const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false }
});

const formSchema = new mongoose.Schema({
  activityID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    // required: true,
    unique: true,
  },
  status: { 
    type: String,
    enum: ["Active", "Closed", "Draft"],
    default: "Draft"
  },
  title: String,
  description: String,

  // Who made this? (Good for multiple admins)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fields: [fieldSchema], // <-- Using the defined fieldSchema for better structure and validation
  /*
  Stores dynamic form fields generated from frontend builder
  Example:
  [
    {
      id: "full_name",
      type: "text",
      label: "Full Name",
      required: true
    }
  ]
  */
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maxSubmissions: {
    type: Number,
    default: Number.MAX_SAFE_INTEGER // <-- No limit by default (infinite)
  },
  requiresLogin: { type: Boolean, default: false }, // <--- The feature you asked for
}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);
module.exports = Form;