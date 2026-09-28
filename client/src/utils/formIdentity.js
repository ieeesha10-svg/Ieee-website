// The two fields every form is built around: the submitter's name and email.
//
// Both are required on every form. `submitForm` refuses a submission without them,
// the attendance ticket and the confirmation email are keyed on the email, and the
// submissions export is keyed on the name. So they ship with every form, the
// builder cannot remove them, and the two public submission pages use them to
// prefill a signed-in member.
//
// Identity is matched by pattern, not by an exact id, because `field.id` is derived
// from the label (see utils/fieldId.js). The builder pins the labels to "Full Name"
// and "Email" so the derived ids are always `full_name` and `email`, but a form
// saved before that pin — or one built through the API — may use "Name" or
// "Email Address", so the lookup stays tolerant. The patterns come from
// formValidation.js, which uses the same pair to enforce them at submit time; the
// two must not drift apart or a form can pass this check and still be rejected.

import { isNameField, isEmailField } from "./formValidation";

/** The labels the builder pins, and the ids they derive. */
export const IDENTITY_LABELS = { name: "Full Name", email: "Email" };

/** A fresh copy for a new form. Kept here so the builder and the server agree. */
export const buildDefaultFields = () => [
  { id: "full_name", label: IDENTITY_LABELS.name, type: "TextInput", required: true },
  { id: "email", label: IDENTITY_LABELS.email, type: "TextInput", required: true },
];

/** Must this field be kept, name and email, in any form? */
export const isIdentityField = (field) => isNameField(field) || isEmailField(field);

/** The name- and email-collecting fields on a form, if it has them. */
export const findIdentityFields = (fields) => ({
  name: (fields || []).find(isNameField) || null,
  email: (fields || []).find(isEmailField) || null,
});

/** Does this field list collect a name and an email, both required? */
export const hasRequiredIdentityFields = (fields) => {
  const { name, email } = findIdentityFields(fields);
  return Boolean(name?.required && email?.required);
};

// The name a member can be greeted by. The API returns it as `name` on the user.
const nameOf = (user) => String(user?.name || user?.fullName || "").trim();
const emailOf = (user) => String(user?.email || "").trim();

/**
 * Seed the identity answers for a member who is signed in.
 *
 * Returns `{}` when there is no user, so a guest is asked for their name and
 * email rather than being given anything. Only the name and email are seeded —
 * every other field is left for the member to fill in.
 *
 * Existing non-empty answers win, so this is safe to run on re-render: it will
 * not overwrite something the member has typed or corrected.
 */
export function prefillIdentityAnswers(fields, user, answers = {}) {
  if (!user) return {};

  const { name, email } = findIdentityFields(fields);
  const seeded = {};

  if (name) {
    const value = nameOf(user);
    if (value) seeded[name.id] = value;
  }

  if (email) {
    const value = emailOf(user);
    if (value) seeded[email.id] = value;
  }

  const pending = Object.entries(seeded).filter(
    ([id, value]) => String(answers[id] ?? "").trim() === "" && value
  );

  return Object.fromEntries(pending);
}
