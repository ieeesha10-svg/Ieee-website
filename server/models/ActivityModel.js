const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: { type: String, enum: ["Active", "Closed", "Draft"], default: "Draft" },
    type: { 
      type: String, 
      enum: ["general", "event", "workshop", "webinar"],
      default: 'general' 
    },
    startDate: Date,
    endDate: Date,
    content: {
      type: String,
    },
    speakers: [
      {
        name: String,
        title: String,
        image: String,
        bio: String,
      },
    ],
    location: {
      type: String,
    },
    capacity: Number,
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;