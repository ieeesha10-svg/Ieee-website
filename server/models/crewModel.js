const mongoose = require("mongoose");

/**
 * A member of a season's Excom, Counselor or Board.
 *
 * Which section a person belongs to is a property of the season, not of the
 * person: the same name can be a Board member one season and Excom the next, so
 * it lives here rather than on the user.
 */
const socialsSchema = new mongoose.Schema(
  {
    linkedin: { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    collabratec: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    website: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const crewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    // Required: a member with no season cannot be shown on /crew, and letting
    // one exist would mean a row silently invisible to every visitor.
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: [true, "A crew member must belong to a season"],
      index: true,
    },
    // Ordered as the sections are displayed: Counselor first, since it is the
    // senior advisory role, then the Excom, then the Board. The order lives here
    // rather than only in the UI so the database, the public season payload and
    // the dashboard dropdown cannot disagree about what exists.
    section: {
      type: String,
      enum: {
        values: ["counselor", "excom", "board"],
        message: 'Section must be one of "counselor", "excom" or "board"',
      },
      required: [true, "A crew member must be in the Excom, the Counselor or the Board"],
      default: "excom",
    },
    // Manual ordering within a section, so the chair can be pinned to the top
    // without the order depending on who happened to be added first.
    order: {
      type: Number,
      default: 0,
    },
    // `email` is a plain address, not a mailto: link, so the public pages can
    // hand it to the visitor's mail client. See crewController for the
    // normalisation that keeps the stored value a bare address.
    socials: {
      type: socialsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// The public crew page always reads one season grouped into its sections, and
// the archive page reads several seasons' worth at once. This index is what
// keeps those reads from being a collection scan as the archive grows.
crewSchema.index({ season: 1, section: 1, order: 1, createdAt: 1 });

const Crew = mongoose.model("Crew", crewSchema);
module.exports = Crew;
