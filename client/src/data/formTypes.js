export const FORM_TYPE_OPTIONS = [
  { value: "", label: "Select a form type" },
  { value: "registration", label: "Registration" },
  { value: "survey", label: "Survey" },
  { value: "feedback", label: "Feedback" },
  { value: "custom", label: "Custom" },
];

export const SURVEY_COLOR = "#5DD9B0";
export const FEEDBACK_COLOR = "#B08FFF";
export const CUSTOM_COLOR = "#FF9F43";

export const FORM_TYPE_BADGE = {
  registration: {
    label: "Registration",
    badge: "bg-primary/10 text-primary border-primary/20",
    dotColor: "#0096ff",
  },
  survey: {
    label: "Survey",
    badge: "border",
    badgeStyle: {
      backgroundColor: `${SURVEY_COLOR}1a`,
      color: SURVEY_COLOR,
      borderColor: `${SURVEY_COLOR}33`,
    },
    dotColor: SURVEY_COLOR,
  },
  feedback: {
    label: "Feedback",
    badge: "border",
    badgeStyle: {
      backgroundColor: `${FEEDBACK_COLOR}1a`,
      color: FEEDBACK_COLOR,
      borderColor: `${FEEDBACK_COLOR}33`,
    },
    dotColor: FEEDBACK_COLOR,
  },
  custom: {
    label: "General",
    badge: "border",
    badgeStyle: {
      backgroundColor: `${CUSTOM_COLOR}1a`,
      color: CUSTOM_COLOR,
      borderColor: `${CUSTOM_COLOR}33`,
    },
    dotColor: CUSTOM_COLOR,
  },
};
