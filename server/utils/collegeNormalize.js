const COLLEGE_ALIASES = {
  cs: "Computer Science",
  "comp sci": "Computer Science",
  "computer science": "Computer Science",
  engineering: "Engineering",
  engneering: "Engineering",
  "faculty of engineering": "Engineering",
  "biomedical engineering": "Biomedical Engineering",
  "biomedical and systems engineering": "Biomedical Engineering",
  "faculty of biomedical engineering": "Biomedical Engineering",
  bis: "BIS",
  "business information systems": "BIS",
  communication: "Communication",
  "communication and computer engineering": "Communication & Computer Engineering",
  "electrical power and machinery": "Electrical Power & Machinery",
  "faculty of science": "Faculty of Science",
  prep: "Prep",
};

function normalizeKey(raw) {
  return (raw || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function titleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeCollege(raw) {
  const key = normalizeKey(raw);
  if (!key) return "";
  return COLLEGE_ALIASES[key] || titleCase(key);
}

module.exports = { normalizeCollege };
