const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  sendBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Done', 'Rejected', 'Not email'], 
    required: true 
  },
  messageBody: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    default: 'Notification' 
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);