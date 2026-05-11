const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Link to the specific form
  formID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  // Link to the User (Enforced now, so we can track history)
  userID: {
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
  // attendedAt: Date

}, { timestamps: true });

// PREVENT DUPLICATES:
// This ensures a user can only submit the same form ONCE.
submissionSchema.index({ FormId: 1, registrantEmail: 1, user: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;