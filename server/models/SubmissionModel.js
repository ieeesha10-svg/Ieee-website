const mongoose = require('mongoose');
const Form = require('./FormModel');
const { isOtherCapable, selectsOther, otherText } = require('../utils/otherOption');

const submissionSchema = new mongoose.Schema({
  // Link to the specific form
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  // Link to the User (set when the submitter is logged in; guests leave it empty)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Guests (form.requiresLogin = false) submit without an account
  },

  // Backup email (Useful for searching without joining tables)
  registrantEmail: { 
    type: String, 
    required: true, 
    index: true 
  },
  // The Answers (e.g. { "question_1": "Answer" })
  answers: {
    type: Object,
    required: true,
  },

  // Free text typed against an "Other" choice on a Dropdown or Checkbox, keyed
  // by field id: { "committee": "Embedded systems" }.
  //
  // Deliberately a separate map rather than part of `answers`. The pre-save
  // check below only accepts a Dropdown/Checkbox answer that is literally one of
  // the field's declared options, and that check is worth keeping: it is what
  // stops a hand-crafted request from writing arbitrary values into the answers
  // a committee later reads and exports. So the answer records the option, this
  // records what the submitter actually said, and only the places that render
  // for a human join the two back together.
  otherAnswers: {
    type: Object,
    default: {},
  },
  
  // `status` used to sit here as an enum of pending/approved/rejected/attended.
  // It duplicated `attended` and nothing ever wrote the three review states, so
  // the only values that could ever appear were the default and the one
  // `scanTicket` set. `attended` below is the single source of truth for whether
  // somebody showed up; the review states are not modelled at all.
    // --- Event Specifics ---
  ticketCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  }, 
  qrImage: String,
  attended: { type: Boolean, default: false },
  attendedAt: Date
}, { timestamps: true });

// PREVENT DUPLICATES:
// An account can only submit the same form ONCE.
//
// This must be a PARTIAL index, not a sparse one. For a compound index MongoDB's
// `sparse` only skips a document when *every* indexed field is missing — a guest
// still has `formId`, so `sparse` would index them as `{ formId, userId: null }`
// and the second guest on a form would collide with the first.
//
// `partialFilterExpression` limits the constraint to submissions that actually
// carry a userId, leaving guest submissions completely unconstrained. Guests are
// de-duplicated by `registrantEmail` inside the submit controller instead.
submissionSchema.index(
  { formId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { userId: { $type: 'objectId' } },
  }
);


submissionSchema.pre('save', async function(next) {
  const Form = mongoose.model('Form');
  const form = await Form.findById(this.formId);

  if (!form) {
    throw new Error('Form not found.');
  }

  const userAnswers = this.answers || {};
  const userOther = this.otherAnswers || {};
  const validationErrors = [];
  const cleanAnswers = {};
  const cleanOther = {};

  for (const field of form.fields) {
    const answer = userAnswers[field.id];

    if (field.required && (answer === undefined || answer === null || answer === '')) {
      validationErrors.push(`Field '${field.label}' is required.`);
      continue;
    }

    if (answer !== undefined && answer !== null && answer !== '') {
      if (field.type === 'Dropdown') {
        if (!field.options.includes(answer)) {
          validationErrors.push(`Invalid option for '${field.label}'. Allowed options are: ${field.options.join(', ')}`);
        }
      } 
      else if (field.type === 'Checkbox') {
        const answerArray = Array.isArray(answer) ? answer : [answer];
        const invalidOptions = answerArray.filter(item => !field.options.includes(item));
        
        if (invalidOptions.length > 0) {
          validationErrors.push(`Invalid choices for '${field.label}': ${invalidOptions.join(', ')}`);
        }
      } 
      else if (field.type === 'TextInput' || field.type === 'TextArea') {
        if (typeof answer !== 'string') {
          validationErrors.push(`Field '${field.label}' must be text.`);
        }
      }
      else if (field.type === 'FileUpload') {
        if (typeof answer !== 'string' || !answer.startsWith('http')) {
          validationErrors.push(`Field '${field.label}' must be a valid uploaded file URL.`);
        }
      }
      cleanAnswers[field.id] = answer;
    }

    // Free text only means something for a field that offers "Other" and was
    // actually given it. Text aimed at any other field, or at a field whose
    // answer is not "Other", is dropped rather than stored: it is not something
    // a submitter could have produced through the form, and keeping it would put
    // unsanitised text into a record a committee reads.
    if (isOtherCapable(field) && selectsOther(field, answer)) {
      const detail = otherText(userOther, field.id);

      if (!detail) {
        validationErrors.push(`Field '${field.label}' needs a value: you chose "Other" but did not say what.`);
      } else {
        cleanOther[field.id] = detail;
      }
    }
  }

  this.answers = cleanAnswers;
  this.otherAnswers = cleanOther;

  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join(' | '));
    err.name = 'ValidationError'; 
    throw err;
  }

  this.answers = cleanAnswers;
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;