// Sample data for the form builder's email preview.
//
// The preview has to answer one question: what will a submitter actually
// receive? Two things make that hard to answer by eye:
//
//   1. db-user[...] resolves for a registered member and stays as literal text
//      for a guest, so an author can write a message that looks right in the
//      editor and is full of "db-user[committee]" in a real guest's inbox.
//   2. db-submissions[...] resolves per field, so a form that was edited after
//      the message was written can reference an answer that no longer exists.
//
// So the preview renders the same message twice, once per case, and reports
// any placeholder that did not resolve. Nothing here is real: no member is
// read from the database, and no email is ever sent.

// A fictional member. Every allowlisted field is filled so an author can see
// each db-user[...] placeholder resolve at least once.
const SAMPLE_MEMBER = {
  name: 'Omar Ali',
  email: 'omar.ali@example.com',
  phone: '+20 100 123 4567',
  position: 'Undergraduate',
  organization: 'IEEE El Shorouk Academy Student Branch',
  roleInOrganization: 'Member',
  yearsOfExperience: 3,
  dateOfBirth: '2004-03-14T00:00:00.000Z',
  university: 'Cairo University',
  college: 'Faculty of Engineering',
  yearOfStudy: 'Third year',
  interests: 'Robotics, Signal Processing',
  committee: 'Technical',
  role: 'Member',
  reasonForRegistration: 'Wants to work on robotics projects',
};

const SAMPLE_NAME = 'Omar Ali';
const SAMPLE_TICKET_CODE = 'PREVIEW-TICKET';

// One plausible answer per field type, so a template panel reads like a real
// submission instead of "undefined" or the placeholder. Dropdown and Checkbox
// take the field's own first option where it has one, because "Technical" as a
// sample answer to "Year of Study" is worse than useless in a preview.
const SAMPLE_ANSWER_BY_TYPE = {
  TextInput: 'Third year',
  TextArea:
    'I would like to join because I enjoy working on hardware and want to '
    + 'learn from the committee members.',
  Dropdown: 'First option',
  Checkbox: ['Robotics', 'Signal Processing'],
  FileUpload: 'https://example.com/uploads/portfolio.pdf',
};

// The values a form is guaranteed to collect, since assertIdentityFields forces
// a name and an email onto every form. They get the same treatment as any other
// field, so the answers panel in a preview matches the real message.
const isNameField = (label) => /^(full[_\-\s]?)?name$/i.test(String(label || '').trim());
const isEmailField = (label) => /e[-_]?mail/i.test(String(label || '').trim());

// Prefer the field's own options, since those are the only values a real
// submission could contain.
const sampleAnswerFor = (field) => {
  const options = (field?.options || []).filter((o) => typeof o === 'string' && o.trim());
  if (field?.type === 'Checkbox') {
    return options.length ? options.slice(0, 2).join(', ') : SAMPLE_ANSWER_BY_TYPE.Checkbox;
  }
  if (field?.type === 'Dropdown') {
    return options[0] ?? SAMPLE_ANSWER_BY_TYPE.Dropdown;
  }
  return SAMPLE_ANSWER_BY_TYPE[field?.type] ?? 'Sample answer';
};

// Build the db-submissions context the controller would pass for a submission
// of this form, filled with sample answers.
const buildSampleSubmissions = (fields = []) => {
  const out = {
    name: SAMPLE_NAME,
    email: SAMPLE_MEMBER.email,
    formTitle: '',
    formType: '',
    ticketCode: SAMPLE_TICKET_CODE,
    submittedAt: new Date().toISOString().slice(0, 10),
  };

  for (const field of fields || []) {
    const label = String(field?.label || '').trim();
    if (!label) continue;
    const key = label.toLowerCase();
    // The reserved values above are the recipient's, not an answer's, so a
    // field called "Name" must not overwrite them. This mirrors the controller,
    // where the answers are spread over the reserved names.
    const value = isNameField(label)
      ? SAMPLE_NAME
      : isEmailField(label)
        ? SAMPLE_MEMBER.email
        : sampleAnswerFor(field);

    out[key] = value;
    // Match the controller, which also keys answers by field id so both
    // db-submissions[Label] and db-submissions[field_id] resolve.
    if (field?.id) out[String(field.id).trim().toLowerCase()] = value;
  }

  return out;
};

// Every db-user[...] / db-submissions[...] in the text, whether or not it
// resolved. With sample data in place, the ones that fail are the ones that
// will also fail for a real member: a misspelt field, or a field deleted since
// the message was written.
const findPlaceholders = (text) => {
  const out = [];
  const seen = new Set();
  for (const m of String(text || '').matchAll(/\bdb-(user|submissions)\[\s*([^\[\]]+?)\s*\]/gi)) {
    const token = `db-${m[1].toLowerCase()}[${m[2].trim()}]`;
    if (seen.has(token)) continue;
    seen.add(token);
    out.push({ token, scope: `db-${m[1].toLowerCase()}`, key: m[2].trim() });
  }
  return out;
};

// Which of those placeholders survive into the rendered output. A placeholder
// that resolved has been replaced, so anything still matching the pattern in
// the result is one the reader would see as raw text.
const { resolveAuthorTokens } = require('./sendEmail');

const findUnresolved = (text, context) =>
  findPlaceholders(text).filter(({ scope, key }) => {
    const probe = resolveAuthorTokens(`${scope}[${key}]`, context);
    return probe === `${scope}[${key}]`;
  });

module.exports = {
  SAMPLE_MEMBER,
  SAMPLE_NAME,
  SAMPLE_TICKET_CODE,
  buildSampleSubmissions,
  findPlaceholders,
  findUnresolved,
};
