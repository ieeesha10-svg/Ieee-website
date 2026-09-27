// Advisory mirror of `server/utils/fieldId.js`.
//
// The server owns field-id derivation: it re-derives every id from its label and
// rejects labels that produce an unusable or duplicated id. This copy exists only
// so the builder can paint an inline hint *before* a round-trip.
//
// Keep `slugifyFieldLabel` byte-for-byte equivalent to the server version. If the
// two ever drift, the worst case is a missing inline hint — the server still
// refuses the bad form and its message is shown verbatim. That is strictly better
// than the previous arrangement, where the client generated an id that the server
// silently overwrote with a different algorithm.

/**
 * Derive a field id from its label.
 *
 * "Full Name"        -> "full_name"
 * "Phone (optional)" -> "phone_optional"
 * "T-Shirt Size"     -> "t-shirt_size"   (hyphens kept)
 * "!!!"              -> ""   (the builder flags this as unusable)
 *
 * @param {string} label
 * @returns {string}
 */
export function slugifyFieldLabel(label) {
  return String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w-]+/g, "");
}

/**
 * Check a list of field labels for the two problems the server rejects:
 * a label that produces no usable id, and two labels that produce the same one.
 *
 * @param {Array<{label?: string}>} fields
 * @returns {{emptyLabels: string[], duplicates: Array<{id: string, labels: string[]}>}}
 */
export function findFieldIdProblems(fields) {
  const list = Array.isArray(fields) ? fields : [];
  const emptyLabels = [];
  const byId = new Map();

  list.forEach((field) => {
    const label = String(field?.label ?? "").trim();
    const id = slugifyFieldLabel(label);

    if (!id) {
      emptyLabels.push(label || "(empty label)");
      return;
    }

    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(label);
  });

  const duplicates = [];
  byId.forEach((labels, id) => {
    if (labels.length > 1) duplicates.push({ id, labels });
  });

  return { emptyLabels, duplicates };
}
