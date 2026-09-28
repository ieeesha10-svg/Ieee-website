// Which form fields carry the submitter's identity.
//
// Every form must collect a name and an email address. `submitForm` refuses a
// submission without both, and the ticket QR, the confirmation email and the
// submissions export are all keyed on them, so a form that cannot ask for them
// is one nobody can submit to.
//
// The lookup is by pattern rather than by an exact id, because `field.id` is
// derived from the label (see fieldId.js). A field labelled "Email Address"
// becomes `email_address`, never `email`, so the id cannot be assumed. The
// patterns match the client-side pair in client/src/utils/formValidation.js —
// the two must stay in step or a form can pass the builder check and then be
// rejected at submission time.

const EMAIL_KEY_RE = /e[-_]?mail/i;
const NAME_KEY_RE = /^(full[_\-\s]?)?name$/i;

const labelOf = (field) => String(field?.label || '').trim();

/** Does this field collect the submitter's email address? */
const isEmailField = (field) =>
  EMAIL_KEY_RE.test(field?.id || '') || EMAIL_KEY_RE.test(labelOf(field));

/** Does this field collect the submitter's name? */
const isNameField = (field) =>
  NAME_KEY_RE.test(field?.id || '') || NAME_KEY_RE.test(labelOf(field));

/** The first name-collecting field on a form, if it has one. */
const findNameField = (form) => (form.fields || []).find(isNameField);

/** The first email-collecting field on a form, if it has one. */
const findEmailField = (form) => (form.fields || []).find(isEmailField);

/**
 * Reject a field list that could never be submitted.
 *
 * `submitForm` already fails such a form at the last moment with a message about
 * the missing answer. Checking at creation time points at the cause instead: the
 * builder.
 *
 * @param {Array} fields
 * @param {import('mongoose').AppError} AppError
 * @throws {AppError} 400 MISSING_IDENTITY_FIELDS
 */
function assertIdentityFields(fields, AppError) {
  const missing = [];

  const nameField = (fields || []).find(isNameField);
  if (!nameField) {
    missing.push('a "Full Name" field');
  } else if (!nameField.required) {
    missing.push('the "Full Name" field marked as required');
  }

  const emailField = (fields || []).find(isEmailField);
  if (!emailField) {
    missing.push('an "Email" field');
  } else if (!emailField.required) {
    missing.push('the "Email" field marked as required');
  }

  if (missing.length === 0) return;

  throw new AppError(
    `This form cannot be submitted without ${missing.join(' and ')}. ` +
      'Every form must ask for a name and an email address, both required.',
    400,
    'MISSING_IDENTITY_FIELDS'
  );
}

module.exports = {
  EMAIL_KEY_RE,
  NAME_KEY_RE,
  isEmailField,
  isNameField,
  findEmailField,
  findNameField,
  assertIdentityFields,
};
