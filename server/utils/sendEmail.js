// const { Resend } = require('resend');
const { BrevoClient } = require('@getbrevo/brevo');
const fs = require('fs');
const path = require('path');
const EmailLog = require('../models/EmailLog');
const { buildEmailDocument } = require('./emailTemplates');

// ===================== PROVIDER: BREVO =====================
// Single Brevo client shared by the whole app
const brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const SENDER_NAME = 'IEEE SHA Student Branch';
const SENDER_EMAIL = 'noreply@ieeesha.org'

// One-time, non-fatal check that the configured sender is actually usable.
let senderChecked = false;
const warnIfSenderInvalid = () => {
  if (senderChecked) return;
  senderChecked = true;
  brevoClient.senders
    .getSenders()
    .then(({ senders }) => {
      const active = (senders || []).filter(s => s.active).map(s => s.email);
      if (!active.includes(SENDER_EMAIL)) {
        console.warn(
          `[sendEmail] WARNING: sender "${SENDER_EMAIL}" is not an active Brevo sender — ` +
          `every email will be rejected at the relay. Active senders: ${active.join(', ') || 'none'}. ` +
          `Set BREVO_SENDER_EMAIL in server/.env.`
        );
      }
    })
    .catch(() => { /* never let a network blip break sending */ });
};
// Brevo's free transactional plan allows 300 sends per day, and that allowance
// resets daily. Brevo's API does NOT report the cap: GET /account returns only
// the remainder as `plan.credits` (with `plan.creditsType: "sendLimit"`), and
// the older endpoints that carried a limit now 404. So the cap lives here as a
// constant and has to be changed by hand if the plan is upgraded.
//
// `used` is therefore derived, not measured: cap - remaining. It is right for a
// daily allowance and silently wrong for a monthly one, which is why it is not
// presented as an authoritative usage figure.
const DAILY_TRANSACTIONAL_LIMIT = 300;

/**
 * Read the remaining transactional email allowance from Brevo.
 *
 * Non-throwing by design: this backs a dashboard readout, and a Brevo outage
 * should not turn the settings page into an error. Callers get `available:
 * false` and the reason, and the UI says so instead of inventing a number.
 */
const getEmailQuota = async () => {
  try {
    const account = await brevoClient.account.getAccount();

    // `plan` comes back as an ARRAY of plans (the SDK types it as
    // Plan.Item[]), so `plan.credits` is undefined and a naive read would
    // report "no data" against a perfectly healthy account. Some tooling
    // unrolls a single-element array when displaying it, which makes this look
    // like a plain object - hence accepting both shapes rather than assuming.
    const rawPlan = account?.plan;
    const plan = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan;
    const credits = plan?.credits;

    if (typeof credits !== 'number') {
      return {
        available: false,
        reason: 'Brevo did not report a remaining email count.',
      };
    }

    const limit = DAILY_TRANSACTIONAL_LIMIT;
    const remaining = Math.max(0, Math.min(limit, credits));

    return {
      available: true,
      plan: plan?.type || 'unknown',
      creditsType: plan?.creditsType || 'sendLimit',
      remaining,
      limit,
      used: Math.max(0, limit - remaining),
      // Fraction remaining, so the bar reads as "how much room is left".
      remainingRatio: limit > 0 ? remaining / limit : 0,
      resetsDaily: true,
    };
  } catch (err) {
    return {
      available: false,
      reason: err?.message || 'Could not reach Brevo.',
    };
  }
};

// ============================================================

// // ===================== PROVIDER: RESEND (disabled) =====================
// // Single Resend client shared by the whole app
// const resend = new Resend(process.env.RESEND_API_KEY);
//
// // Verified sender in Resend (noreply@ieeesha.org)
// const SENDER_EMAIL = 'IEEE SHA Student Branch <noreply@ieeesha.org>';
// // =======================================================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load an HTML template from the emails_Templates folder
const loadTemplate = (templateName) => {
  return fs.readFileSync(
    path.join(__dirname, '../view/emails_Templates', templateName),
    'utf-8'
  );
};

// Dynamically replace {{placeholder}} and [placeholder] tokens with data values.
// Unknown tokens are left untouched so the sender can spot them easily.
const renderTemplate = (template, data = {}) => {
  return template.replace(/\{\{\s*([^{}]+?)\s*\}\}|\[\s*([^\[\]]+?)\s*\]/g, (match, curlyKey, squareKey) => {
    const key = (curlyKey || squareKey).trim();
    const dataKey = Object.keys(data).find(k => k.toLowerCase() === key.toLowerCase());
    const value = dataKey !== undefined ? data[dataKey] : data[key];

    return value !== undefined && value !== null && value !== '' ? value : match;
  });
};

// Escape a value that is about to be spliced into an HTML email.
//
// Every message here is HTML, and `{{token}}` substitution is a raw string
// replace, so a value carrying markup used to be rendered as markup. That value
// is not always trusted: `userName` is free text typed by whoever submitted the
// form, and a form title is typed by any admin with dashboard access. Escaping
// keeps them as text.
//
// `qrDataUrl` is the deliberate exception: it is an `<img>` tag this file builds
// itself rather than user input, so it is passed through raw.
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => (
    {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]
  ));

// ============================================================
//  db-user[...] and db-submissions[...]
// ============================================================
// The only two placeholders a form author writes. They deliberately replace the
// older {{token}} / [token] syntax, which was a third competing system and
// invited mistakes: "[name]" looked like a placeholder but never resolved, and
// bare "[...]" also swallowed ordinary text like "Session [2026]".
//
//   db-user[...]         a field on the submitter's own account
//                        e.g. db-user[committee], db-user[university]
//   db-submissions[...]  a value on the submission itself
//                        e.g. db-submissions[formTitle], db-submissions[qrCode],
//                            db-submissions[Year of Study]  (any form answer)
//
// Anything that cannot be resolved is left exactly as written, so the author sees
// the placeholder that failed instead of the member receiving "undefined". A
// guest has no account at all, which means every db-user[...] survives untouched
// for them by design. db-submissions[...] always resolves, because the answers
// exist whether or not the submitter is a member.
//
// `db-user` is read through an allowlist rather than by handing over the whole
// user document. `User` carries password, otp and resetPasswordToken, and a
// template is author-editable text, so a blanket copy would let a template mail
// out credentials.
const USER_FIELD_ALLOWLIST = [
  'name',
  'email',
  'phone',
  'position',
  'organization',
  'roleInOrganization',
  'yearsOfExperience',
  'age',
  'university',
  'college',
  'yearOfStudy',
  'interests',
  'committee',
  'role',
  'reasonForRegistration',
];

// The submission values worth suggesting in the builder. These are the ones that
// are not answer fields, so an author would otherwise have no way to reach them.
const RECOMMENDED_SUBMISSION_FIELDS = [
  'name',
  'email',
  'formTitle',
  'formType',
  'ticketCode',
  'qrCode',
  'qrUrl',
  'submittedAt',
];

const readUserField = (user, key) => {
  // Case-insensitive so db-user[University] and db-user[university] both work.
  const match = USER_FIELD_ALLOWLIST.find(
    (allowed) => allowed.toLowerCase() === key.trim().toLowerCase()
  );
  if (!match || !user) return undefined;
  const value = user[match];
  if (value === undefined || value === null) return undefined;
  // interests is a list; a comma-separated line reads better than [object Object].
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
};

const caseInsensitiveGet = (map, key) => {
  if (!map) return undefined;
  const wanted = key.trim().toLowerCase();
  const hit = Object.keys(map).find((k) => k.toLowerCase() === wanted);
  return hit === undefined ? undefined : map[hit];
};

// The one place author placeholders are resolved.
//
// `qrCode` is the sole value passed through unescaped: it is an <img> tag this
// file builds itself, not something a submitter typed. Every other value is
// free text from the submitter or an admin, so it is escaped.
const RAW_HTML_SUBMISSION_FIELDS = new Set(['qrcode']);

const resolveAuthorTokens = (source, { dbUser = null, dbSubmissions = {} } = {}) => {
  const text = String(source ?? '');
  if (!text) return text;
  return text.replace(
    /\bdb-(user|submissions)\[\s*([^\[\]]+?)\s*\]/gi,
    (match, kind, rawKey) => {
      const key = rawKey.trim();
      const value =
        kind.toLowerCase() === 'user'
          ? readUserField(dbUser, key)
          : caseInsensitiveGet(dbSubmissions, key);
      // Empty is treated as unresolved on purpose: showing a blank would leave a
      // confusing gap, so the author sees the placeholder and can fix the spelling.
      if (value === undefined || value === null || value === '') return match;
      if (kind.toLowerCase() === 'submissions' && RAW_HTML_SUBMISSION_FIELDS.has(key.toLowerCase())) {
        return String(value);
      }
      return escapeHtml(value);
    }
  );
};

// Low-level send: single Brevo call, throws on API error
const sendEmail = async ({ to, subject, html, attachments }) => {
  // // Old Resend implementation (disabled)
  // const { data, error } = await resend.emails.send({
  //   from: SENDER_EMAIL,
  //   to,
  //   subject,
  //   html,
  //   ...(attachments && attachments.length > 0 ? { attachments } : {})
  // });
  //
  // if (error) {
  //   throw new Error(error.message);
  // }
  //
  // return data;

  // NOTE: @getbrevo/brevo v6 resolves with the response payload itself
  // ({ messageId }), NOT `{ data }` — destructuring `data` yielded undefined.
  const response = await brevoClient.transactionalEmails.sendTransacEmail({
    htmlContent: html,
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    subject,
    to: [{ email: to }],
    // Brevo's field is `attachment` (singular); `attachments` is ignored by the API.
    ...(attachments && attachments.length > 0
      ? { attachment: attachments.map(att => ({ name: att.filename, content: att.content.toString('base64') })) }
      : {})
  });

  return response;
};

// Render a stored template inside the shared email shell (page background,
// content card, gutter, footer card) and send it.
//
// The stored templates under view/emails_Templates/ are internal and still keyed
// on {{token}}, so renderTemplate stays for them. On top of that an author
// placeholder such as db-user[committee] is resolved, which lets a stored
// template mix the two. Neither input is required.
const sendTemplateEmail = async ({
  to, subject, template, data = {}, preheader, dbUser = null, dbSubmissions = {},
}) => {
  const body = resolveAuthorTokens(renderTemplate(loadTemplate(template), data), {
    dbUser,
    dbSubmissions,
  });
  const html = buildEmailDocument({
    content: body,
    title: subject,
    preheader: preheader || subject,
  });
  return sendEmail({ to, subject, html });
};

// Convert multer temp files into Brevo attachment payloads (read once, before the loop)
const buildAttachments = async (attachmentFiles = []) => {
  const mailAttachments = [];
  for (const att of attachmentFiles) {
    try {
      const content = await fs.promises.readFile(att.path);
      mailAttachments.push({
        filename: att.originalname,
        content
      });
    } catch (err) {
      console.error('Error reading attachment:', err);
    }
  }
  return mailAttachments;
};

// Personalize a bulk message body: replace [column] tokens with row/user values
const personalizeMessage = (message, data = {}) => renderTemplate(message, data);

// Unified bulk sender: personalize -> send -> log -> delay for each recipient.
// `onResult` is called with { email, status } after every attempt.
const sendBulkEmails = async ({
  recipients,
  subject,
  messageBody,
  attachments = [],
  sendBy,
  delayMs = 1000,
  onResult,
}) => {
  const mailAttachments = await buildAttachments(attachments);
  const mailSubject = subject || 'Notification';

  for (const recipient of recipients) {
    const { email, data = {} } = recipient;
    // Shared shell, so a bulk body lines up with the footer exactly like the
    // transactional templates do. Built per recipient because the body is
    // personalised.
    const html = buildEmailDocument({
      content: personalizeMessage(messageBody, data),
      title: mailSubject,
      preheader: mailSubject,
    });

    try {
      const result = await sendEmail({ to: email, subject: mailSubject, html, attachments: mailAttachments });
      // console.log(`Email sent to ${email}:`, result);
      await EmailLog.create({ sendBy, email, subject: mailSubject, status: 'Done', messageBody: html });
      if (onResult) onResult({ email, status: 'Done' });
    } catch (err) {
      console.error(`Brevo Error for ${email}:`, err.message);
      await EmailLog.create({ sendBy, email, subject: mailSubject, status: 'Rejected', messageBody: html });
      if (onResult) onResult({ email, status: 'Rejected' });
    }

    if (delayMs > 0) await sleep(delayMs);
  }
};

// 1. OTP Email
const sendOTPEmail = async (recipientEmail, otpCode) => {
  try {
    await sendTemplateEmail({
      to: recipientEmail,
      subject: 'Verify Your Account - OTP',
      template: 'sendOTP.html',
      data: { otpCode }
    });
    return true;
  } catch (err) {
    console.error('Server Error sending OTP Email:', err);
    return false;
  }
};

// 2. Ticket Email for Submission Controller
const sendTicketEmail = async ({ email, userName, ticketCode, eventTitle }) => {
  try {
    await sendTemplateEmail({
      to: email,
      subject: `Confirmation of Registration – ${eventTitle}`,
      template: 'ticketEmail.html',
      data: { userName: escapeHtml(userName), eventTitle: escapeHtml(eventTitle), ticketCode: escapeHtml(ticketCode) }
    });
    return true;
  } catch (err) {
    console.error('Server Error sending Ticket Email:', err);
    return false;
  }
};

// 3. Reset Password Email
const resetPasswordEmailToken = async (recipientEmail, resetToken) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction
      ? process.env.CLIENT_URL ||'https://ieeesha.org'
      : 'http://localhost:5173';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    await sendTemplateEmail({
      to: recipientEmail,
      subject: 'Reset Your Password',
      template: 'resetPassword.html',
      data: { resetToken, resetLink }
    });
    return true;
  } catch (err) {
    console.error('Server Error sending Reset Password Email:', err);
    return false;
  }
};

// 4. Committee Decision Email (acceptance / rejection after interview)
const sendCommitteeDecisionEmail = async ({ email, userName, committeePosition, accepted }) => {
  try {
    await sendTemplateEmail({
      to: email,
      subject: accepted
        ? `Congratulations! You've been accepted into ${committeePosition}`
        : `Update on your application for ${committeePosition}`,
      template: 'committeeDecision.html',
      data: {
        userName: escapeHtml(userName),
        committeePosition: escapeHtml(committeePosition),
        bannerBg: accepted ? '#16a34a' : '#cc2e2e',
        bannerTitle: accepted ? 'Application Approved' : 'Application Update',
        panelBg: accepted ? '#f0fdf4' : '#f8fafc',
        message: accepted
          ? `Congratulations! We're thrilled to welcome you to the ${committeePosition} committee.`
          : `Thank you for your interest in the ${committeePosition} committee. Unfortunately, after the interview stage we are unable to move forward with your application this time.`
      }
    });
    return true;
  } catch (err) {
    console.error('Server Error sending Committee Decision Email:', err);
    return false;
  }
};

// 5. Submission Received Email
// Sent to every form submission (guest or logged-in) confirming the application
// landed. This replaces the old QR "ticket confirmation" email, which fired on
// registration forms and was confusing when the form was not an event.
const sendSubmissionReceivedEmail = async ({ email, userName, formTitle, dbUser = null, dbSubmissions = {} }) => {
  try {
    await sendTemplateEmail({
      to: email,
      subject: 'We received your application',
      template: 'submissionReceived.html',
      data: { userName: escapeHtml(userName), formTitle: escapeHtml(formTitle) },
      dbUser,
      dbSubmissions
    });
    return true;
  } catch (err) {
    console.error('Server Error sending Submission Received Email:', err);
    return false;
  }
};

// 6. Custom post-submission email
// The subject and body are written by the form author in the builder, so there
// is no template file. This path deliberately does NOT run renderTemplate: the
// author gets exactly one syntax, db-user[...] and db-submissions[...]. Feeding
// {{token}} / [token] through here too was the source of the confusion, and a
// bare [2026] in a subject got eaten by the old [token] pass.
//
// The QR travels inline so the ticket arrives in the same message the author
// wrote rather than as a second email. On a form with no QR the placeholder is
// removed rather than left as literal text, since an unresolvable placeholder is
// otherwise shown on purpose.
// Turn a custom email into the finished subject and HTML document.
//
// Split out from sendCustomSubmissionEmail because the builder's preview needs
// the exact same output, and a preview that reimplemented this would drift from
// what members actually receive. Nothing here sends: the caller decides.
const renderCustomSubmissionEmail = ({
  subject,
  messageBody,
  formTitle,
  userName,
  ticketCode,
  qrDataUrl,
  dbUser = null,
  dbSubmissions = {},
}) => {
  const hasQr = Boolean(qrDataUrl);

  // Values the author cannot type, exposed under the recommended
  // db-submissions[...] names so every placeholder is the same shape.
  // Left raw on purpose: resolveAuthorTokens escapes on substitution, so
  // escaping here as well would double-escape and a real name like
  // "Rane & Omar" would arrive as "Rane &amp;amp; Omar".
  const reserved = {
    name: userName,
    formtitle: formTitle,
    ticketcode: ticketCode,
    qrurl: hasQr ? qrDataUrl : undefined,
    qrcode: hasQr
      ? `<img src="${qrDataUrl}" alt="Your ticket QR code" width="220" height="220" style="display:block;width:220px;height:220px;border:0;border-radius:8px;" />`
      : undefined,
  };

  // Answers are merged over the reserved names so a form's own fields reach the
  // message. Note the flip side: a field an author labels exactly "Name" will
  // shadow the submitter's name, the same as it does in submissionController.
  const context = { dbUser, dbSubmissions: { ...reserved, ...dbSubmissions } };


  const stripMissingQr = (text) =>
    hasQr
      ? text
      : text.replace(/\bdb-submissions\[\s*(qrcode|qrurl)\s*\]/gi, '');

  const body = resolveAuthorTokens(stripMissingQr(String(messageBody || '')), context);

  // The subject is author-written text too, so it resolves the same way. Without
  // this a subject mentioning db-submissions[formTitle] went out verbatim.
  const resolvedSubject = resolveAuthorTokens(String(subject || ''), context);

  const html = buildEmailDocument({
    content: body,
    title: resolvedSubject,
    preheader: resolvedSubject,
  });

  return { subject: resolvedSubject, html };
};

const sendCustomSubmissionEmail = async ({
  to,
  subject,
  messageBody,
  formTitle,
  userName,
  ticketCode,
  qrDataUrl,
  dbUser = null,
  dbSubmissions = {},
}) => {
  try {
    const { subject: resolvedSubject, html } = renderCustomSubmissionEmail({
      subject,
      messageBody,
      formTitle,
      userName,
      ticketCode,
      qrDataUrl,
      dbUser,
      dbSubmissions,
    });

    await sendEmail({ to, subject: resolvedSubject, html });
    return true;
  } catch (err) {
    console.error('Server Error sending Custom Submission Email:', err);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendTemplateEmail,
  sendBulkEmails,
  buildAttachments,
  personalizeMessage,
  sendOTPEmail,
  sendTicketEmail,
  resetPasswordEmailToken,
  sendCommitteeDecisionEmail,
  sendSubmissionReceivedEmail,
  sendCustomSubmissionEmail,
  // The renderer behind sendCustomSubmissionEmail, reused by the builder's
  // preview so the preview cannot drift from the real message.
  renderCustomSubmissionEmail,
  // Exported for the submission controller's db-submissions[...] lookup and for tests.
  resolveAuthorTokens,
  readUserField,
  escapeHtml,
  // Internal {{token}} pass, used by the stored templates in view/emails_Templates.
  renderTemplate,
    USER_FIELD_ALLOWLIST,
    RECOMMENDED_SUBMISSION_FIELDS,
    // Remaining transactional allowance, for the dashboard quota readout.
    getEmailQuota,
  };

