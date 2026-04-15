// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  // UPDATED ROLES:
  role: { 
    type: String, 
    enum: [
      'user',      // Normal student (default)
      'member',    // Paid/Official IEEE Member
      'board',     // Board Member (Can access dashboard but limited delete rights)
      'xcom',     // Tech Head / Chairman (Full Control)
      'scanner'    // Event Volunteer (Only access to Scan Page)
    ], 
    default: 'user' 
  },
  
  // Optional: Track which committee they belong to (good for filtering later)
  age: { type: Number }, // العمر يعم
  university: { type: String }, // e.g., "MIT", "Stanford"
  college: { type: String }, // e.g., "Computer Science", "Electrical Engineering"
  yearOfStudy: { type: Number }, // e.g., 1, 2, 3, 4,5
  interests: [{ type: String }], // e.g., ["AI", "Robotics", "Web Development"]
  committee: { type: String }, // e.g., "HR", "Technical", "PR"
  optionalData:{type:Object} //to store any additional data

}, { timestamps: true });


const User = mongoose.model('User', userSchema);
module.exports = User;