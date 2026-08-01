const ORDINAL_OPTIONS = [
  { label: "Graduate", value: 0 },
  { label: "1st Year", value: 1 },
  { label: "2nd Year", value: 2 },
  { label: "3rd Year", value: 3 },
  { label: "4th Year", value: 4 },
  { label: "5th Year", value: 5 },
];

const YEAR_MAP = Object.fromEntries(
  ORDINAL_OPTIONS.map(({ label, value }) => [label, value]),
);

const ORDINAL = Object.fromEntries(
  ORDINAL_OPTIONS.filter(({ value }) => value !== 0).map(({ label, value }) => [
    value,
    label.replace(" Year", ""),
  ]),
);

export { ORDINAL, ORDINAL_OPTIONS, YEAR_MAP };
export default ORDINAL;
