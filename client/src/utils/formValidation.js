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
//
// isPlaceholderAnswer is the exception to that framing: it is not about form
// submissions at all, so SignupPage and UserProfile import it too. It lives here
// rather than in a new module because this is already the one place someone
// looks for 'how do we validate input'.

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

// People filling in a form tend to type "N/A" rather than leave a field blank
// when it does not apply to them, and that then lands in the database looking
// exactly like a real answer. Matched on a normalised form so "N/A", "N / A",
// "N.A." and "not applicable" are all caught by the one check.
//
// Bare "na" is deliberately NOT in the list. It is too close to real data - it
// is Namibia's country code, and a "country code" field is precisely the sort of
// thing the form builder lets an admin create. A false rejection blocks a real
// submission, which is worse than letting one placeholder through.
const PLACEHOLDER_ANSWERS = new Set([
  "n/a",
  "n.a",
  "n.a.",
  "notapplicable",
  "notavailable",
  "none",
  "nil",
  "null",
  "tbd",
  "-",
  "--",
  "?",
]);

export const PLACEHOLDER_ANSWER_MESSAGE =
  "Use a real value, or leave this blank if it does not apply";

// Whitespace is stripped rather than collapsed, so "N / A" and "N A" both reduce
// to the same key the table above holds.
const normalise = (value) => String(value).trim().toLowerCase().replace(/\s+/g, "");

export const isPlaceholderAnswer = (value) =>
  typeof value === "string" && PLACEHOLDER_ANSWERS.has(normalise(value));

/**
 * Find the first field holding a placeholder answer, by its human label.
 *
 * For the forms that report a single problem with a toast rather than painting
 * an error under each input, so they still say *which* field to fix instead of
 * only that something is wrong.
 *
 * @param {Object<string, unknown>} fields  label -> value
 * @returns {string|null} the offending label, or null when all are fine
 */
export function firstPlaceholderField(fields) {
  for (const [label, value] of Object.entries(fields || {})) {
    if (isPlaceholderAnswer(value)) return label;
  }
  return null;
}

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

    if (isPlaceholderAnswer(val)) {
      errs[id] = PLACEHOLDER_ANSWER_MESSAGE;
      continue;
    }

    if (typeof otherAnswers[id] === "string" && isPlaceholderAnswer(otherAnswers[id])) {
      errs[id] = PLACEHOLDER_ANSWER_MESSAGE;
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
