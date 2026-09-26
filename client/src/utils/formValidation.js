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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_KEY_RE = /e[-_]?mail/i;
const NAME_KEY_RE = /^(full[_\-\s]?)?name$/i;

const labelOf = (field) => String(field?.label || "").trim();

export const isEmailField = (field) =>
  EMAIL_KEY_RE.test(field?.id || "") || EMAIL_KEY_RE.test(labelOf(field));

export const isNameField = (field) =>
  NAME_KEY_RE.test(field?.id || "") || NAME_KEY_RE.test(labelOf(field));

/**
 * Validate a set of answers against a form's field list.
 *
 * @param {Array}  fields  form.fields
 * @param {Object} answers answers keyed by field.id
 * @param {Object} files   uploaded files keyed by field.id
 * @param {Object} [opts]
 * @param {boolean} [opts.requireName=true]   enforce a name even if the field is optional
 * @param {boolean} [opts.requireEmail=true]  enforce an email even if the field is optional
 * @returns {Object} map of fieldId -> error message
 */
export function validateSubmission(fields, answers, files = {}, opts = {}) {
  const { requireName = true, requireEmail = true } = opts;
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
      }
      continue;
    }

    if (!val) {
      if (field.required) errs[id] = `${labelOf(field)} is required`;
      else if (isNameField(field) && requireName) errs[id] = "Full Name is required";
      else if (isEmailField(field) && requireEmail) errs[id] = "Email address is required";
      continue;
    }

    // Format check runs whenever there is a value, required or not.
    if (isEmailField(field) && typeof val === "string" && !EMAIL_RE.test(val)) {
      errs[id] = "Please enter a valid email address";
    }
  }

  return errs;
}
