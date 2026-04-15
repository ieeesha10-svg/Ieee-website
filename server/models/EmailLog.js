const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  // 1. Who sent it?
  sentBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // 2. When?
  sendDate: { type: Date, default: Date.now },

  // 3. Source
  sentFrom: { 
    type: String, 
    enum: ['Excel Upload', 'Database Filter', 'Single Email'], 
    required: true 
  },

  // 4. Batch Info
  subject: { type: String },

  // 5. Detailed Results
  emails: [
    {
      email: { type: String, required: true },
      state: { type: Boolean, required: true }, // true = success
      err: { type: String } // Error message if failed
    }
  ],

  // 6. Quick Stats
  totalSent: { type: Number, default: 0 },
  totalFailed: { type: Number, default: 0 }

});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
module.exports =  EmailLog;