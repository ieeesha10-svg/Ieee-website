const mongoose = require('mongoose');
const Form = require('./FormModel');

const submissionSchema = new mongoose.Schema({
  // Link to the specific form
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  // Link to the User (Enforced now, so we can track history)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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
  
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "attended", "not attended"],
    default: "pending",
  },
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
// This ensures a user can only submit the same form ONCE.
submissionSchema.index(
  { formId: 1, userId: 1 },
  { unique: true }
);


submissionSchema.pre('save', async function(next) {
  const Form = mongoose.model('Form');
  const form = await Form.findById(this.formId);

  if (!form) {
    throw new Error('Form not found.');
  }

  const userAnswers = this.answers || {};
  const validationErrors = [];
  const cleanAnswers = {}; 

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

      cleanAnswers[field.id] = answer;
    }
  }

  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join(' | '));
    err.name = 'ValidationError'; 
    throw err;
  }

  this.answers = cleanAnswers;
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;