const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true,
    unique: true,
  },
  title: { type: String, required: true },
  description: String,
  
  // This stores the Drag-and-Drop JSON from React
  // structure: { type: Array, required: true }, 

  // Who made this? (Good for multiple admins)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

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
  fields: {
    type: Array,
    required: true,
  },
  // Logic Settings
  settings: {
    maxSubmissions: { type: Number, default: 0 }, // 0 = Infinite
    expiryDate: Date,
    requiresLogin: { type: Boolean, default: false }, // <--- The feature you asked for
    isActive: { type: Boolean, default: true }
  },
}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);
module.exports = Form;



