const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  
  // This stores the Drag-and-Drop JSON from React
  structure: { type: Array, required: true }, 

  // Who made this? (Good for multiple admins)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Logic Settings
  type: { 
    type: String, 
    enum: ['general', 'event', 'workshop'], 
    default: 'general' 
  },
  settings: {
    maxSubmissions: { type: Number, default: 0 }, // 0 = Infinite
    expiryDate: Date,
    requiresLogin: { type: Boolean, default: false }, // <--- The feature you asked for
    isActive: { type: Boolean, default: true }
  }
}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);
module.exports = Form;



