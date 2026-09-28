export const ALLOWED_TYPES = ["TextInput", "TextArea", "Dropdown", "Checkbox", "FileUpload"];

export const FIELD_TYPE_OPTIONS = [
  { value: "TextInput", label: "Short Text" },
  { value: "TextArea", label: "Paragraph" },
  { value: "Dropdown", label: "Dropdown" },
  { value: "Checkbox", label: "Checkbox" },
  { value: "FileUpload", label: "File Upload" },
];

// Every Dropdown and Checkbox gets this appended automatically, so a submitter
// is never trapped by a list the author did not think of. Picking it reveals a
// free-text box.
//
// The presence of this exact string in `field.options` is what enables the
// behaviour everywhere - the builder, the public form, submission validation and
// the email. There is no separate flag to keep in sync. An author who deletes the
// option turns the behaviour off, which is why it is removable like any other.
//
// Must stay in sync with OTHER_OPTION in server/utils/otherOption.js.
export const OTHER_OPTION = "Other";

// Case and surrounding whitespace are ignored when matching, so an author who
// types "other" by hand still gets the free-text box.
export const isOtherOption = (value) =>
  String(value ?? "").trim().toLowerCase() === OTHER_OPTION.toLowerCase();

// Append the option unless it is already there. Never duplicates, and never
// re-adds it to a field whose author deliberately removed it.
export const withOtherOption = (options = []) => {
  const list = Array.isArray(options) ? options : [];
  return list.some(isOtherOption) ? list : [...list, OTHER_OPTION];
};

export const hasOtherOption = (field) =>
  (field?.options || []).some(isOtherOption);

export const isOptionsType = (type) =>
  type === "Dropdown" || type === "Checkbox";

// Has this field just become a Dropdown or a Checkbox, rather than already being
// one? Only on that transition is "Other" appended.
//
// The distinction matters because every option edit also travels through the
// builder's single "update this field" function. Appending on all of them would
// mean removing the option re-added it on the very next render, and an author
// could never drop it. Staying silent when the field was already an options type
// is what makes the removal stick, and switching Dropdown <-> Checkbox afterwards
// leaves the author's choice alone.
export const entersOptionsType = (currentType, nextType) =>
  isOptionsType(nextType) && !isOptionsType(currentType);

// Put an "Other" choice back together with the text that was typed for it, so
// somewhere a person reads it back as a sentence rather than a bare "Other".
// Mirrors composeAnswerValue in server/utils/otherOption.js; keep the two in
// step so the dashboard, the email and the spreadsheet agree.
export const composeOtherValue = (field, answer, otherAnswers = {}) => {
  const chosen = Array.isArray(answer) ? answer : [answer];
  if (!chosen.some(isOtherOption)) {
    return Array.isArray(answer) ? answer.join(", ") : answer;
  }

  const detail = String(otherAnswers?.[field?.id] || "").trim();
  // No detail recorded: leave the answer exactly as it was rather than writing
  // an empty "Other: " into a record a committee reads.
  if (!detail) {
    return Array.isArray(answer) ? answer.join(", ") : answer;
  }

  const labelled = `Other: ${detail}`;
  if (!Array.isArray(answer)) return labelled;
  return [...answer.filter((item) => !isOtherOption(item)), labelled].join(", ");
};
