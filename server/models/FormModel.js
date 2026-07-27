const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    validate: { 
      validator: (v) => typeof v === 'string' && v.trim() !== '', 
      message: 'ID is required and must be a non-empty string' 
    } 
  },
  label: { 
    type: String, 
    required: true, 
    validate: { 
      validator: (v) => typeof v === 'string' && v.trim() !== '', 
      message: 'Label is required and must be a non-empty string' 
    } 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['TextInput', 'TextArea', 'Dropdown', 'Checkbox', 'FileUpload'],
  },
  required: { 
    type: Boolean, 
    default: true, 
    validate: { 
      validator: (v) => typeof v === 'boolean', 
      message: 'Required must be a boolean' 
    } 
  },
  
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        if (['Dropdown', 'Checkbox'].includes(this.type)) {
          return Array.isArray(v) && v.length > 0;
        }
        return true; 
      },
      message: 'Options array is required and must have at least one item for Dropdown and Checkbox types'
    }
  }
});

const formSchema = new mongoose.Schema({
  activityID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
  },
  status: { 
    type: String,
    enum: ["Active", "Closed", "Draft", "upcoming"],
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
  type : String,
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
  requiresLogin: { type: Boolean, default: false }, // <--- The feature you asked for: If true, users must be logged in to submit the form. If false, anyone can submit.
}, { timestamps: true });


formSchema.pre('save', function() {
  if (this.isModified('fields')) {
    this.fields.forEach(field => {
      if (field.label) {
        field.id = field.label
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w-]+/g, '');
        }
      });
    }
  }
);

const Form = mongoose.model('Form', formSchema);
module.exports = Form;