const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    statusActivity: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: { 
      type: String, 
      enum: ["general", "event", "workshop", "webinar"],
      default: 'general' 
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
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
      required: true
    },
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
    coverImage: {
      type: String
    },
    coverImagePublicId: { 
      type: String,
    }
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);
module.exports = Activity;