// const { Resend } = require('resend');
const { BrevoClient } = require('@getbrevo/brevo');
const fs = require('fs');
const path = require('path');
const EmailLog = require('../models/EmailLog');
const { getEmailFooter } = require('./emailTemplates');

// ===================== PROVIDER: BREVO =====================
// Single Brevo client shared by the whole app
const brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const SENDER_NAME = 'IEEE SHA Student Branch';
const SENDER_EMAIL = 'noreply@ieeesha.org';
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

  const { data } = await brevoClient.transactionalEmails.sendTransacEmail({
    htmlContent: html,
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    subject,
    to: [{ email: to }],
    ...(attachments && attachments.length > 0
      ? { attachments: attachments.map(att => ({ name: att.filename, content: att.content.toString('base64') })) }
      : {})
  });

  return data;
};

// Render a stored template + footer and send it dynamically
const sendTemplateEmail = async ({ to, subject, template, data = {} }) => {
  const html = renderTemplate(loadTemplate(template), data) + getEmailFooter();
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
    const html = personalizeMessage(messageBody, data);

    try {
      await sendEmail({ to: email, subject: mailSubject, html, attachments: mailAttachments });
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
      data: { userName, eventTitle, ticketCode }
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
        userName,
        committeePosition,
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

module.exports = {
  sendEmail,
  sendTemplateEmail,
  sendBulkEmails,
  buildAttachments,
  personalizeMessage,
  sendOTPEmail,
  sendTicketEmail,
  resetPasswordEmailToken,
  sendCommitteeDecisionEmail
};
