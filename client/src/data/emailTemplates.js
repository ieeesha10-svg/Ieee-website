// Ready-made messages for the post-submission email.
//
// Three rules govern everything in this file:
//
// 1. The body is emailed as HTML, so these are HTML fragments. The sender wraps
//    whatever is here in the shared shell that carries the header and the footer
//    card, so a full <html>/<body> wrapper would nest badly. Styling is inline
//    because most mail clients drop <style> blocks and class attributes.
//
// 2. There is exactly one placeholder syntax, in two flavours:
//      db-user[field]        the submitter's account, e.g. db-user[committee]
//      db-submissions[Field] this submission, e.g.
//        - a recommended value: db-submissions[formTitle], [name], [ticketCode],
//          [qrCode] (the inline image), [qrUrl] (the raw data URL), [email],
//          [formType], [submittedAt]
//        - any answer this form collected, e.g. db-submissions[Year of Study]
//    The older db-submissions[formTitle] / [token] syntax is gone: three competing
//    spellings was the confusion, and a bare "[2026]" in a subject used to be
//    eaten. Anything unresolvable is left as written, so a guest's message keeps
//    its db-user[...] placeholders rather than printing "undefined".
//
// 3. Subjects use the same syntax as the body. `fillSubject` previews the real
//    text in the browser, and the server resolves whatever is left.

// One shared visual language: a 600px column, a brand-blue accent, and a small
// set of components (panel, key/value row, pill) reused by every template.
const s = {
  wrap: 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#111827;margin:0',
  h: 'margin:0 0 14px;font-size:20px;line-height:1.35;font-weight:700;color:#0b1220;letter-spacing:-0.01em',
  p: 'margin:0 0 14px',
  muted: 'margin:0 0 14px;font-size:14px;line-height:1.6;color:#5b6472',
  panel:
    'margin:22px 0;padding:18px 20px;background:#f6f9fd;border:1px solid #e3ebf5;border-radius:12px',
  panelTitle:
    'margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0069b4',
  row: 'margin:0 0 10px;font-size:15px;line-height:1.5',
  rowLast: 'margin:0;font-size:15px;line-height:1.5',
  key: 'color:#6b7482',
  val: 'color:#111827;font-weight:600',
  code:
    'display:inline-block;padding:3px 10px;background:#0b1220;color:#fff;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:20px;letter-spacing:4px',
  ticket:
    'margin:22px 0;padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;text-align:center',
  list: 'margin:0;padding-left:20px',
  li: 'margin:0 0 8px',
  liLast: 'margin:0',
  sign: 'margin:22px 0 0;font-size:15px;line-height:1.6;color:#111827',
  signMuted: 'color:#6b7482;font-size:14px',
  qr: 'margin:24px 0;text-align:center',
};

// One key/value line for the answers block: "Year of Study: 3rd year".
const answerRow = (label, i, total) =>
  `        <p style="${i === total - 1 ? s.rowLast : s.row}">` +
  `<span style="${s.key}">${label}:</span> <span style="${s.val}">db-submissions[${label}]</span></p>`;

// The answers block, built from the form's own fields so the template reflects
// what this particular form actually asks for. Full Name and Email are skipped:
// the greeting already uses the name, and the email is where the message is
// going, so repeating them reads as noise. A form with no extra fields gets no
// block at all rather than an empty panel.
const answersBlock = (fieldLabels) => {
  if (!fieldLabels || !fieldLabels.length) return '';
  return [
    '',
    `      <div style="${s.panel}">`,
    `        <p style="${s.panelTitle}">What you submitted</p>`,
    ...fieldLabels.map((label, i) => answerRow(label, i, fieldLabels.length)),
    '      </div>',
  ].join('\n');
};

const wrap = (inner) => [`<div style="${s.wrap}">`, inner, '</div>'].join('\n');

export const EMAIL_TEMPLATES = [
  {
    id: 'general-thanks',
    categories: ['*'],
    label: 'General thank you',
    description: 'Short and neutral. Works for any form.',
    subject: 'Thanks for your submission',
    nextStep: null,
    build: (fields) =>
      wrap(
        [
          `      <p style="${s.h}">Thanks, db-submissions[name]</p>`,
          `      <p style="${s.p}">We have your submission for <strong>db-submissions[formTitle]</strong> and it has reached the right team.</p>`,
          answersBlock(fields),
          `      <p style="${s.muted}">If we need anything else from you, we will reply to this address.</p>`,
          `      <p style="${s.sign}">Best regards,<br />IEEE SHA Student Branch</p>`,
        ].join('\n')
      ),
  },

  {
    id: 'attendance-ticket',
    categories: ['attendance'],
    label: 'Ticket confirmation',
    description: 'Confirms the seat and embeds the QR ticket for the gate.',
    subject: 'Your ticket for db-submissions[formTitle]',
    nextStep: [
      'Arrive ten minutes early so the queue stays short.',
      'Have the QR below ready at the entrance.',
      'If it will not scan, quote the ticket code at the desk.',
    ],
    build: (fields) =>
      wrap(
        [
          `      <p style="${s.h}">You are on the list</p>`,
          `      <p style="${s.p}">Hi db-submissions[name], your seat for <strong>db-submissions[formTitle]</strong> is confirmed.</p>`,
          `      <div style="${s.ticket}">`,
          `        <p style="${s.panelTitle};margin-bottom:8px">Ticket code</p>`,
          `        <p style="margin:0"><span style="${s.code}">db-submissions[ticketCode]</span></p>`,
          '      </div>',
          // The QR is minted per submission, so it travels with this registration
          // rather than with the member's account: one ticket per form.
          `      <div style="${s.qr}">db-submissions[qrCode]</div>`,
          answersBlock(fields),
          `      <p style="${s.muted}">Show the QR code at the entrance and you are in. See you there,<br />IEEE SHA Student Branch</p>`,
        ].join('\n')
      ),
  },

  {
    id: 'recruitment-received',
    categories: ['recruitment'],
    label: 'Application received',
    description: 'Confirms the application and sets expectations on next steps.',
    subject: 'We received your application for db-submissions[formTitle]',
    nextStep: [
      'Our committee reviews every application.',
      'Shortlisted applicants are emailed for an interview.',
      'You will hear from us either way.',
    ],
    build: (fields) =>
      wrap(
        [
          `      <p style="${s.h}">Application received</p>`,
          `      <p style="${s.p}">Hi db-submissions[name], thanks for applying to <strong>db-submissions[formTitle]</strong>. Your application is in.</p>`,
          `      <div style="${s.panel}">`,
          `        <p style="${s.panelTitle}">What happens next</p>`,
          `        <ol style="${s.list}">`,
          '          <li style="' + s.li + '">Our committee reviews every application.</li>',
          '          <li style="' + s.li + '">If you are shortlisted you will be emailed for an interview.</li>',
          '          <li style="' + s.liLast + '">You will hear from us either way.</li>',
          '        </ol>',
          '      </div>',
          answersBlock(fields),
          `      <p style="${s.muted}">This message is addressed to you alone, so please do not forward it.</p>`,
          `      <p style="${s.sign}">Good luck,<br />IEEE SHA Student Branch</p>`,
        ].join('\n')
      ),
  },

  {
    id: 'workshop-confirmation',
    categories: ['workshop'],
    label: 'Workshop seat confirmed',
    description: 'Confirms the place and tells them what to expect.',
    subject: 'Your seat for db-submissions[formTitle]',
    nextStep: [
      'Arrive a few minutes early to register.',
      'Bring a laptop and anything we asked for.',
    ],
    build: (fields) =>
      wrap(
        [
          `      <p style="${s.h}">Your seat is confirmed</p>`,
          `      <p style="${s.p}">Hi db-submissions[name], you are booked in for the workshop <strong>db-submissions[formTitle]</strong>.</p>`,
          `      <div style="${s.panel}">`,
          `        <p style="${s.panelTitle}">Before you come</p>`,
          `        <ul style="${s.list}">`,
          '          <li style="' + s.li + '">Arrive a few minutes early to register.</li>',
          '          <li style="' + s.liLast + '">Bring a laptop and any materials we asked for.</li>',
          '        </ul>',
          '      </div>',
          answersBlock(fields),
          `      <p style="${s.muted}">Need to withdraw? Reply to this email so we can offer your seat to someone on the waitlist.</p>`,
          `      <p style="${s.sign}">Best regards,<br />IEEE SHA Student Branch</p>`,
        ].join('\n')
      ),
  },

  {
    id: 'survey-thanks',
    categories: ['survey'],
    label: 'Survey thank you',
    description: 'Short thanks, no next steps. Best for surveys.',
    subject: 'Thank you for your feedback on db-submissions[formTitle]',
    nextStep: null,
    build: (fields) =>
      wrap(
        [
          `      <p style="${s.h}">Thank you</p>`,
          `      <p style="${s.p}">Hi db-submissions[name], thanks for completing <strong>db-submissions[formTitle]</strong>. Your answers go straight into our planning.</p>`,
          answersBlock(fields),
          `      <p style="${s.muted}">We read every response.</p>`,
          `      <p style="${s.sign}">Best regards,<br />IEEE SHA Student Branch</p>`,
        ].join('\n')
      ),
  },

  {
    id: 'feedback-received',
    categories: ['feedback'],
    label: 'Feedback received',
    description: 'Thanks someone for reporting a problem or sending an idea.',
    subject: 'Thanks for the feedback on db-submissions[formTitle]',
    nextStep: null,
    build: (fields) =>
      wrap(
        [
          `      <p style="${s.h}">Thanks for letting us know</p>`,
          `      <p style="${s.p}">Hi db-submissions[name], thank you for sending feedback about <strong>db-submissions[formTitle]</strong>. It has reached the team.</p>`,
          answersBlock(fields),
          `      <p style="${s.muted}">Useful reports are the fastest way to get things fixed, so thank you for taking the time.</p>`,
          `      <p style="${s.sign}">Best regards,<br />IEEE SHA Student Branch</p>`,
        ].join('\n')
      ),
  },
];

// The form's own fields, minus the two identity fields.
//
// The name is already in the greeting and the email is where the message is
// going, so listing them again in an "What you submitted" panel would be noise.
// The result is what makes a template specific to the form: a recruitment form
// asking for a portfolio gets a portfolio line, a survey does not.
export const customFieldLabels = (fields = []) =>
  (fields || [])
    .filter((f) => f && f.label && !/^(full[_\-\s]?)?name$/i.test(f.label.trim()))
    .filter((f) => !/e[-_]?mail/i.test(f.label.trim()))
    .map((f) => f.label.trim());

// The picker shows the templates that suit the form's category, and never shows
// an empty row: `*` marks the templates that apply to everything, and a form
// saved under a retired type still gets the general one.
export const templatesForCategory = (category, fields = []) => {
  const labels = customFieldLabels(fields);
  return EMAIL_TEMPLATES.filter(
    (t) => t.categories.includes('*') || t.categories.includes(category)
  ).map((t) => ({ ...t, body: t.build(labels) }));
};

// The subjects above are written with the same placeholders as the body, so they
// need the same preview substitution. The server resolves whatever is left, so
// this is purely so the author sees the real text while editing.
export const fillSubject = (subject, formTitle) =>
  String(subject || '').replace(
    /\bdb-submissions\[\s*formTitle\s*\]/gi,
    formTitle || 'your submission'
  );
