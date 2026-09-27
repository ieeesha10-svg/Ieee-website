// Form categories.
//
// `value` is what gets persisted as `form.type` and must match the `type` enum in
// server/models/FormModel.js. `attendance` is the ticket-bearing type: the server
// mints the QR ticket code only for it, and every activity-linked form is created
// as `attendance`.
//
// `label` is the full human name, used in the builder dropdown where there is room
// for it. `shortLabel` is the condensed form used on badges, cards and the public
// filter tabs, where "Attendance or Event Registration" would not fit.

export const FORM_TYPE_OPTIONS = [
  { value: "", label: "Select a form type" },
  { value: "recruitment", label: "Recruitment" },
  { value: "feedback", label: "Feedback" },
  { value: "attendance", label: "Attendance or Event Registration" },
  { value: "workshop", label: "Workshop" },
  { value: "survey", label: "Survey" },
];

export const RECRUITMENT_COLOR = "#4CC9F0";
export const ATTENDANCE_COLOR = "#0096ff";
export const WORKSHOP_COLOR = "#FFB703";
export const SURVEY_COLOR = "#5DD9B0";
export const FEEDBACK_COLOR = "#B08FFF";
// `other` is legacy: forms saved before the current type set keep it. Never offered
// in the builder, but still needs a badge and icon so old forms render.
export const LEGACY_COLOR = "#FF9F43";

const tinted = (hex) => ({
  badge: "border",
  badgeStyle: {
    backgroundColor: `${hex}1a`,
    color: hex,
    borderColor: `${hex}33`,
  },
  dotColor: hex,
});

export const FORM_TYPE_BADGE = {
  recruitment: { label: "Recruitment", ...tinted(RECRUITMENT_COLOR) },
  attendance: { label: "Attendance", ...tinted(ATTENDANCE_COLOR) },
  workshop: { label: "Workshop", ...tinted(WORKSHOP_COLOR) },
  survey: { label: "Survey", ...tinted(SURVEY_COLOR) },
  feedback: { label: "Feedback", ...tinted(FEEDBACK_COLOR) },
  other: { label: "General", ...tinted(LEGACY_COLOR) },
};

// Used whenever a form carries a type this build does not know about.
export const DEFAULT_FORM_TYPE_BADGE = FORM_TYPE_BADGE.other;
