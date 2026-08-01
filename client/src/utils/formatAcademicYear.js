import ORDINAL from "../data/ordinalMap";

export function formatAcademicYear(year) {
  if (year == null) return "N/A";
  const num = Number(year);
  if (num === 0) return "Graduate";
  return `${ORDINAL[num] || num} Year`;
}
