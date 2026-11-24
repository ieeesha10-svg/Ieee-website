const mongoose = require('mongoose');
const { slugifyFieldLabel } = require('../utils/fieldId');

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
  Stores dynamic form fields generated from frontend builder.
  `id` is always derived from `label` by the pre-validate hook below — clients
  must not supply their own.
  Example:
  [
    {
      id: "full_name",
      type: "TextInput",
      label: "Full Name",
      required: true
    }
  ]
  */
  // Must stay in sync with FORM_TYPE_OPTIONS in client/src/data/formTypes.js.
  // "other" is legacy-only: forms saved before the current type set keep it so
  // they never fail validation. It is not offered in the builder.
  type : {
    type: String,
    enum: ["attendance", "recruitment", "feedback", "workshop", "survey", "other"],
    default: "other"
  },
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
  sendEmailOnSubmission: {
    type: Boolean,
    default: false
  },
  // Subject and body of the email the form author wants sent after a
  // submission. Only read when `sendEmailOnSubmission` is true. The body is
  // author-written HTML and is rendered through the same {{token}} pass as the
  // built-in templates, so it can interpolate {{formTitle}}, {{userName}} and,
  // for attendance forms, {{qrDataUrl}}.
  submissionEmailSubject: {
    type: String,
    trim: true,
    default: '',
    maxlength: 200
  },
  submissionEmailBody: {
    type: String,
    trim: true,
    default: '',
    maxlength: 5000
  },
  requiresLogin: { type: Boolean, default: false }, // Form-builder setting: when true, only logged-in users can submit; when false (default), anyone can submit.
}, { timestamps: true });


// `field.id` is derived from `field.label` rather than trusted from the client,
// because that id is the key every answer is stored under. See utils/fieldId.js.
//
// This runs on 'validate', not 'save', so canonical ids exist by the time
// fieldSchema's own `required` validator runs. On 'save' it ran *after*
// validation, which meant a label that slugs to nothing surfaced as a generic
// "ID is required" naming a field the client had named differently.
//
// The isModified('fields') guard keeps legacy documents loadable: a form that
// already has duplicate ids from before this fix can still be toggled closed
// without validation blowing up on the unrelated write.
formSchema.pre('validate', function () {
  if (!this.isModified('fields')) return;

  this.fields.forEach((field) => {
    if (field.label) field.id = slugifyFieldLabel(field.label);
  });
});


const Form = mongoose.model('Form', formSchema);
module.exports = Form;