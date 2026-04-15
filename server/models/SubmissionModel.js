const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Link to the specific Form
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  
  // Link to the User (Enforced now, so we can track history)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },

  // Backup email (Useful for searching without joining tables)
  registrantEmail: { 
    type: String, 
    required: true, 
    index: true 
  },

  // The Answers (e.g. { "question_1": "Answer" })
  data: { 
    type: Object, 
    required: true 
  }, 
  
  // --- Event Specifics ---
  ticketCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  }, 
  attended: { 
    type: Boolean, 
    default: false 
  },
  attendedAt: Date

}, { timestamps: true });

// PREVENT DUPLICATES:
// This ensures a user can only submit the same form ONCE.
submissionSchema.index({ formId: 1, userId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;