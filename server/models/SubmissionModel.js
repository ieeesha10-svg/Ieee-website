const mongoose = require('mongoose');

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
    enum: ["pending", "approved", "rejected", "attended"],
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

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;

/**

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({

  formID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },

  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  registrantEmail: {
    type: String,
    required: true,
    index: true
  },

  answers: {
    type: Object,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "attended"],
    default: "pending",
  }

}, { timestamps: true });


// Prevent duplicate submissions
submissionSchema.index(
  { formID: 1, userID: 1 },
  { unique: true }
);


const Submission = mongoose.model(
  'Submission',
  submissionSchema
);

module.exports = Submission;

 */