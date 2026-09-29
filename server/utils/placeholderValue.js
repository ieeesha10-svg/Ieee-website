// Placeholder answers typed into a real field.
//
// Someone filling in a form that does not apply to them will type "N/A" rather
// than leave it blank, and the string then sits in the database looking exactly
// like something a person meant. Sorting members by college, or filtering a CSV
// export, then treats "N/A" as a real value and quietly produces wrong results.
//
// This is the server-side half. The client blocks the same strings for a better
// error message, but client validation is a suggestion - it can be skipped with
// devtools or by calling the API directly, so the rule has to be enforced where
// the data is actually written.
//
// Must stay in sync with PLACEHOLDERS in client/src/utils/formValidation.js.
//
// Bare "na" is deliberately absent. It is Namibia's country code, and a "country
// code" question is exactly what a form author can add at any time. Refusing a
// legitimate answer is a worse failure than storing one stray placeholder.
const PLACEHOLDERS = new Set([
  'n/a',
  'n.a',
  'n.a.',
  'notapplicable',
  'notavailable',
  'none',
  'nil',
  'null',
  'tbd',
  '-',
  '--',
  '?',
]);

const PLACEHOLDER_MESSAGE =
  'Use a real value, or leave this blank if it does not apply';

// Whitespace is removed rather than collapsed so "N / A", "N A" and "n/a" all
// reduce to the same key.
const normalise = (value) =>
  String(value == null ? '' : value).trim().toLowerCase().replace(/\s+/g, '');

const isPlaceholderValue = (value) => typeof value === 'string' && PLACEHOLDERS.has(normalise(value));

// Every offending key in a { key: value } map, so one response can name all of
// them instead of making the caller resubmit to discover the next one.
const placeholderKeysIn = (map) => {
  if (!map || typeof map !== 'object') return [];
  return Object.keys(map).filter((key) => isPlaceholderValue(map[key]));
};

module.exports = {
  PLACEHOLDERS,
  PLACEHOLDER_MESSAGE,
  isPlaceholderValue,
  placeholderKeysIn,
};
