// The "Other" option on Dropdown and Checkbox fields.
//
// A submitter can always say something the author's list did not anticipate:
// picking "Other" reveals a free-text box. The typed text is kept in a separate
// `submission.otherAnswers` map rather than in `submission.answers`, because
// SubmissionModel validates that every Dropdown/Checkbox answer is literally one
// of the field's declared options. Keeping the answer a clean option value and
// the detail beside it means existing readers of `answers` - the dashboard, the
// CSV, the confirmation email - keep their "value is an option" assumption, and
// the free text is joined in only where a human will read it.
//
// The presence of this exact string in `field.options` is the whole switch. There
// is no separate flag, so a form that already had an option called "Other" starts
// behaving correctly, and an author who removes the option turns it off.
//
// Must stay in sync with OTHER_OPTION in client/src/data/fieldTypes.js.
const OTHER_OPTION = 'Other';

const isOtherOption = (value) =>
  String(value == null ? '' : value).trim().toLowerCase() === OTHER_OPTION.toLowerCase();

const hasOtherOption = (field) => Array.isArray(field?.options) && field.options.some(isOtherOption);

// Only the field types that carry an option list can offer "Other" at all.
const isOtherCapable = (field) =>
  field?.type === 'Dropdown' || field?.type === 'Checkbox';

// Was "Other" actually chosen? A Dropdown stores a single string, a Checkbox an
// array, so both shapes are checked.
const selectsOther = (field, answer) => {
  if (!isOtherCapable(field)) return false;
  if (Array.isArray(answer)) return answer.some(isOtherOption);
  return isOtherOption(answer);
};

// The text the submitter typed for an "Other" choice, or '' when there is none.
const otherText = (otherAnswers, fieldId) => {
  if (!otherAnswers || typeof otherAnswers !== 'object') return '';
  const value = otherAnswers[fieldId];
  return typeof value === 'string' ? value.trim() : '';
};

// Turn a stored answer into the sentence a person should read.
//
//   Dropdown "Other"                 -> "Other: Embedded systems"
//   Checkbox ["Robotics", "Other"]   -> "Robotics, Other: Embedded systems"
//   anything else                    -> unchanged
//
// A Dropdown whose only answer is "Other" still reads "Other: ..." rather than
// dropping the prefix, so it stays obvious in an inbox that the value was free
// text rather than one of the author's own words.
const composeAnswerValue = (field, answer, otherAnswers) => {
  if (!selectsOther(field, answer)) {
    return Array.isArray(answer) ? answer.join(', ') : answer;
  }

  const detail = otherText(otherAnswers, field.id);
  if (!detail) {
    // No detail recorded: leave the answer exactly as it was rather than
    // inventing an empty "Other: ".
    return Array.isArray(answer) ? answer.join(', ') : answer;
  }

  const labelled = `${OTHER_OPTION}: ${detail}`;
  if (!Array.isArray(answer)) return labelled;
  return [...answer.filter((item) => !isOtherOption(item)), labelled].join(', ');
};

module.exports = {
  OTHER_OPTION,
  isOtherOption,
  hasOtherOption,
  isOtherCapable,
  selectsOther,
  otherText,
  composeAnswerValue,
};
