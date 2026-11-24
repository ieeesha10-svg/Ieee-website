/**
 * Canonical field-id derivation.
 *
 * A field's `id` is derived from its `label` and is the key that answers are
 * stored under (`Submission.answers[field.id]`), the key the renderer binds its
 * inputs to, and the column key in the Excel export. It is therefore part of the
 * form's data contract and must be produced in exactly one place.
 *
 * This module is that one place. `FormModel`'s pre-validate hook and the
 * `createForm` / `createActivity` controllers all call in here, so a form can
 * never be saved with two fields sharing an id, and a label that slugs to
 * nothing is rejected with a useful message instead of failing Mongoose's
 * generic "ID is required" check.
 *
 * NOTE: `client/src/utils/fieldId.js` mirrors `slugifyFieldLabel` so the builder
 * can show inline hints before submit. That copy is advisory only — the server
 * re-derives and re-checks every id, and its message wins. If the two ever
 * drift apart the worst case is a missing inline hint, never bad data.
 */

/**
 * Derive a field id from its label.
 *
 * This is deliberately the exact algorithm the `FormModel` pre-save hook has
 * always used. Ids are the keys stored answers live under, so changing the
 * derivation would rename ids on the next form edit and orphan every existing
 * answer for that field. Same labels in, same ids out.
 *
 * `"Full Name"`        -> "full_name"
 * `"Email Address"`    -> "email_address"
 * `"Phone (optional)"` -> "phone_optional"   (punctuation deleted, not kept)
 * `"T-Shirt Size"`     -> "t-shirt_size"     (hyphens kept)
 * `"Roll No. 1"`       -> "roll_no_1"
 * `"!!!"`              -> ""                  (caller must reject this)
 *
 * @param {string} label
 * @returns {string} the derived id, or "" if the label has no usable characters
 */
function slugifyFieldLabel(label) {
  return String(label == null ? '' : label)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '');
}

/**
 * Derive an id for every field, and report the ones that cannot be used.
 *
 * Two distinct labels can slug to the same id — "Phone (optional)" and
 * "Phone optional" both become "phone_optional". That used to slip through,
 * producing a form where two inputs shared one answer key. We now reject it at
 * creation time rather than storing a form that silently overwrites its own
 * responses.
 *
 * @param {Array<{label?: string}>} fields
 * @returns {{ ids: string[], emptyLabels: string[], duplicates: Array<{id: string, labels: string[]}> }}
 *          `ids` is positionally aligned with `fields`.
 */
function deriveFieldIds(fields) {
  const list = Array.isArray(fields) ? fields : [];
  const ids = [];
  const emptyLabels = [];
  const byId = new Map();

  list.forEach((field, index) => {
    const label = String((field && field.label) || '').trim();
    const id = slugifyFieldLabel(label);

    ids[index] = id;

    if (!id) {
      emptyLabels.push(label || '(empty label)');
      return;
    }

    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(label);
  });

  const duplicates = [];
  byId.forEach((labels, id) => {
    if (labels.length > 1) duplicates.push({ id, labels });
  });

  return { ids, emptyLabels, duplicates };
}

/**
 * Build a human-readable message for the problems `deriveFieldIds` found.
 *
 * @param {{ emptyLabels: string[], duplicates: Array<{id: string, labels: string[]}> }} result
 * @returns {string} "" when there is nothing wrong
 */
function describeFieldIdProblems(result) {
  const parts = [];

  if (result.emptyLabels.length > 0) {
    parts.push(
      `These field labels do not produce a usable field id, so they cannot be saved: ${result.emptyLabels.join(', ')}`
    );
  }

  result.duplicates.forEach(({ id, labels }) => {
    parts.push(
      `The field labels ${labels.map((l) => `"${l}"`).join(' and ')} both become the id "${id}". Rename one so every label is unique.`
    );
  });

  return parts.join(' ');
}

module.exports = {
  slugifyFieldLabel,
  deriveFieldIds,
  describeFieldIdProblems,
};
