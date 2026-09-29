// server/models/User.js
const mongoose = require("mongoose");
const { isPlaceholderValue, PLACEHOLDER_MESSAGE } = require("../utils/placeholderValue");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      select: false,
      match: [
        /^.{8,}$/,
        "Password must be at least 8 characters",
      ],
    },
    phone: { type: String, trim: true},
    position: {
      type: String,
      enum: ["student", "professional"]
    },
    // Professional-specific fields
    organization: { type: String }, // e.g., "Google", "Siemens"
    roleInOrganization: { type: String }, // e.g., "Software Engineer", "HR Manager"
    yearsOfExperience: { type: Number }, // e.g., 3, 5, 10
    reasonForRegistration: { type: String }, // Optional
    // UPDATED ROLES:
    role: {
      type: String,
      enum: [
        "user", // Normal student (default)
        "member", // Paid/Official IEEE Member
        "board", // Board Member (Can access dashboard but limited delete rights)
        "xcom", // Tech Head / Chairman (Full Control)
        "scanner", // Event Volunteer (Only access to Scan Page)
      ],
      default: "user",
    },
    // OTP system for Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    },

    // Optional: Track which committee they belong to (good for filtering later)
    // Replaces the old numeric `age`. Left optional deliberately: a DOB is
    // personally identifying and a lot of members will skip it, so nothing
    // depends on it being present. Age is derived from this when needed rather
    // than stored, which also stops the two fields drifting out of sync.
    dateOfBirth: {
      type: Date,
      required: false,
      // The numeric age field used to carry a 15-99 range, so this takes over the
      // one part of that worth keeping: a date that has not happened yet is
      // always a typo, never a real birth date. No lower bound, because a
      // minimum age would quietly turn this optional field into a required one.
      validate: {
        validator: (value) => !value || value.getTime() <= Date.now(),
        message: "Date of birth cannot be in the future",
      },
    },
    university: { type: String }, // Student-specific: e.g., "MIT", "Stanford"
    college: { type: String }, // Student-specific: e.g., "Computer Science", "Electrical Engineering"
    yearOfStudy: { type: Number }, // Student-specific: e.g., 1, 2, 3, 4,5
    interests: [{ type: String }], // e.g., ["AI", "Robotics", "Web Development"]
    committee: { type: String }, // e.g., "HR", "Technical", "PR"
    optionalData: { type: Object }, //to store any additional data
  },
  { timestamps: true },
);

// The free-text fields someone actually types into. Deliberately not the
// enum-ish ones (position, role, committee, yearOfStudy): those are chosen from a
// fixed list, so they cannot hold a typed "N/A" in the first place, and
// optionalData.interests is an array handled below.
const FREE_TEXT_PATHS = [
  "name",
  "phone",
  "university",
  "college",
  "organization",
  "roleInOrganization",
  "reasonForRegistration",
  "optionalData.aboutMe",
];

// Runs for every write - self sign-up, an admin creating a member, and a
// self-service profile update - because a schema hook is the one place all
// three share. Registering a member with college "N/A" is the exact case that
// makes exports and filters lie later, so it is worth the hook.
//
// Registered BEFORE mongoose.model() on purpose. Compiling a model clones the
// schema, so a hook attached to `userSchema` afterwards lands on the original
// object and is silently never called - validation still passes and the rule
// looks installed while doing nothing. Keep this above the model() call.
// Synchronous on purpose, and it throws rather than calling next(). Mongoose 9
// no longer hands a `next` callback to a pre-validate hook that declares one,
// so the callback style either does nothing or fails with "next is not a
// function" - and a throw is what this hook actually wants, since there is
// nothing to await.
userSchema.pre("validate", function rejectPlaceholderAnswers() {
  for (const path of FREE_TEXT_PATHS) {
    if (isPlaceholderValue(this.get(path))) {
      throw new Error(`${path}: ${PLACEHOLDER_MESSAGE}`);
    }
  }

  // interests is an array of strings, so a single "N/A" hides inside it.
  if (Array.isArray(this.interests)) {
    for (const value of this.interests) {
      if (isPlaceholderValue(value)) {
        throw new Error(`interests: ${PLACEHOLDER_MESSAGE}`);
      }
    }
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
