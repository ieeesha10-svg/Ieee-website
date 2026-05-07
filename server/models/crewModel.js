const mongoose = require("mongoose");

const crewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  bio: {
    type: String,
  },
}, {
  timestamps: true
});

const Crew = mongoose.model("Crew", crewSchema);
module.exports = Crew;