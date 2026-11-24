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
  // Set when a decision is made, and kept afterwards so the dashboard can show
  // who approved or rejected a request. A decided request is never deleted —
  // the history is the point of the Approved/Rejected tabs.
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// One user can only have a request awaiting a decision at a time; the decided
// ones are history and must not be blocked by this.
pendingRequestSchema.index(
  { userId: 1, request_status: 1 },
  {
    partialFilterExpression: { request_status: "pending" },
    unique: true,
  },
);

const PendingRequest = mongoose.model("PendingRequest", pendingRequestSchema);
module.exports = PendingRequest;
