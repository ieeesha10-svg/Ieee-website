const mongoose = require("mongoose");

/**
 * A season groups one cohort of the committee: its Excom and its Board.
 * Members live in `Crew` and point at a season through `Crew.season`.
 *
 * The site shows one season at a time, so `isHome` is the pointer for "the
 * season currently advertised on the home page". At most one season may have it;
 * `PUT /api/seasons/:id/home` is the only thing that sets it and it clears the
 * others in the same call, so this never needs a unique partial index to stay
 * correct (Mongo has no such thing, and a transaction would be overkill for a
 * single boolean an admin toggles by hand).
 */
const seasonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Season name is required"],
      trim: true,
      // Two seasons with the same label would make the archive's season picker
      // ambiguous, and the "is this the same season?" question unanswerable.
      unique: true,
    },
    // True for the one season rendered on the home page. Everything else is
    // reachable only through /crew, which is what makes them previous seasons.
    isHome: {
      type: Boolean,
      default: false,
    },
    // Newest season first. Assigned as the current count on create so a brand
    // new season lands above the older ones without the admin sorting anything.
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

seasonSchema.virtual("memberCount", {
  ref: "Crew",
  localField: "_id",
  foreignField: "season",
  count: true,
});

seasonSchema.index({ isHome: 1 });

const Season = mongoose.model("Season", seasonSchema);
module.exports = Season;
