// Shared client-side validation for form submissions.
//
// Both FormSubmissionPage and EventRegistration post to POST /api/submissions,
// and the server now enforces three things on every submission regardless of how
// the form was built in the builder:
//   1. a name ("Full Name" / "Name" / ...)
//   2. an email address
//   3. a syntactically valid email address
//
// Keeping this in one place stops the two pages from drifting apart, which is
// what previously left EventRegistration without any email-format check.

import { isOtherOption } from "../data/fieldTypes";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_KEY_RE = /e[-_]?mail/i;
const NAME_KEY_RE = /^(full[_\-\s]?)?name$/i;

const labelOf = (field) => String(field?.label || "").trim();

export const isEmailField = (field) =>
  EMAIL_KEY_RE.test(field?.id || "") || EMAIL_KEY_RE.test(labelOf(field));

export const isNameField = (field) =>
  NAME_KEY_RE.test(field?.id || "") || NAME_KEY_RE.test(labelOf(field));

export const OTHER_TEXT_REQUIRED = 'Tell us what you mean by "Other"';

// A Dropdown stores one string, a Checkbox an array; both can carry "Other".
const selectsOther = (value) => {
  if (Array.isArray(value)) return value.some(isOtherOption);
  return isOtherOption(value);
};

// The "Other" box is required as soon as "Other" is chosen, on a required field
// or an optional one. The submitter has said the answer is not on the author's
// list, so an empty box records something nobody can act on.
const missingOtherText = (value, text) =>
  selectsOther(value) && !String(text || "").trim();

/**
 * Validate a set of answers against a form's field list.
 *
 * @param {Array}  fields  form.fields
 * @param {Object} answers answers keyed by field.id
 * @param {Object} files   uploaded files keyed by field.id
 * @param {Object} [opts]
 * @param {boolean} [opts.requireName=true]   enforce a name even if the field is optional
 * @param {boolean} [opts.requireEmail=true]  enforce an email even if the field is optional
 * @param {Object} [opts.otherAnswers]        free text keyed by field.id, for "Other" choices
 * @returns {Object} map of fieldId -> error message
 */
export function validateSubmission(fields, answers, files = {}, opts = {}) {
  const { requireName = true, requireEmail = true, otherAnswers = {} } = opts;
  const errs = {};

  for (const field of fields || []) {
    const { id, type } = field;

    if (type === "FileUpload") {
      if (field.required && !files[id]) errs[id] = `${labelOf(field)} is required`;
      continue;
    }

    const raw = answers[id];
    const val = typeof raw === "string" ? raw.trim() : raw;

    if (type === "Checkbox") {
      if (field.required && (!val || val.length === 0)) {
        errs[id] = `${labelOf(field)} is required`;
      } else if (missingOtherText(val, otherAnswers[id])) {
        errs[id] = OTHER_TEXT_REQUIRED;
      }
      continue;
    }

    if (!val) {
      if (field.required) errs[id] = `${labelOf(field)} is required`;
      else if (isNameField(field) && requireName) errs[id] = "Full Name is required";
      else if (isEmailField(field) && requireEmail) errs[id] = "Email address is required";
      continue;
    }

    if (missingOtherText(val, otherAnswers[id])) {
      errs[id] = OTHER_TEXT_REQUIRED;
      continue;
    }

    // Format check runs whenever there is a value, required or not.
    if (isEmailField(field) && typeof val === "string" && !EMAIL_RE.test(val)) {
      errs[id] = "Please enter a valid email address";
    }
  }

  return errs;
}
