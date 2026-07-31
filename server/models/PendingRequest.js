const mongoose = require("mongoose");

const pendingRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  committee_position: {
    type: String,
    required: true,
  },
  request_status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, {
  timestamps: true,
});

const PendingRequest = mongoose.model("PendingRequest", pendingRequestSchema);
module.exports = PendingRequest;
