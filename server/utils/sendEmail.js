const { Resend } = require('resend');
const dotenv = require('dotenv').config()
const { getEmailFooter } = require('./emailTemplates');
const fs = require('fs');
const path = require('path');

// Initialize Resend with your API Key from Render Environment Variables
// console.log('Resend API Key:', process.env.RESEND_API_KEY); // For debugging, remove in production
const resend = new Resend(process.env.RESEND_API_KEY);
// const resend = new Resend(process.env.RESEND_API_KEY);

// The email address you verified in Resend (e.g., noreply@ieeesha.org)
const SENDER_EMAIL = 'IEEE SHA Student Branch <noreply@ieeesha.org>'; 

// Load HTML templates from your views folder
const loadTemplate = (templateName) => {
  return fs.readFileSync(
    path.join(__dirname, '../view/emails_Templates', templateName), 'utf-8'
  )
}

// 1. OTP Email
const sendOTPEmail = async (recipientEmail, otpCode) => {
  try {
    let html = loadTemplate('sendOTP.html');
    html = html.replace('{{otpCode}}', otpCode);
    html += getEmailFooter();
    
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipientEmail,
      subject: 'Verify Your Account - OTP',
      html: html
    });

    if (error) {
      console.error('Resend API Error (OTP):', error);
      return false;
    }
    return true;
  }
  catch(err){
    console.log('Server Error sending OTP Email:', err);
    return false;
  }
};

// 2. Ticket Email for Submission Controller
const sendTicketEmail = async(email, userName, ticketCode, eventTitle, qrImage) => {
  try {
    const base64Data = qrImage.split('base64,')[1];
    let html = loadTemplate('ticketEmail.html');
    html = html.replaceAll('{{userName}}', userName)
      .replaceAll('{{eventTitle}}', eventTitle)
      .replaceAll('{{ticketCode}}', ticketCode);
    html += getEmailFooter();
    
    const { error } = await resend.emails.send({
       from: SENDER_EMAIL,
       to: email,
       subject: `Confirmation of Registration – ${eventTitle}`,
       html: html,
      //  attachments: [{
      //   filename: 'ticket-qr.png',
      //   content: base64Data, // Resend automatically handles base64 string attachments
      //   content_id: 'qr-code-image'
      //  }]
    });

    if (error) {
      console.error('Resend API Error (Ticket):', error);
      return false;
    }
    return true
  }
  catch(err){
    console.error('Server Error sending Ticket Email:', err);
    return false;
  }
};

// 3. Reset Password Email
const resetPasswordEmailToken = async (recipientEmail, resetToken) => {
  try {
    let html = loadTemplate('resetPassword.html');
    html = html.replace('{{resetToken}}', resetToken);
    html += getEmailFooter();
    
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipientEmail,
      subject: 'Reset Your Password',
      html: html
    });

    if (error) {
      console.error('Resend API Error (Reset Password):', error);
      return false;
    }
    return true;
  }
  catch(err){
    console.log('Server Error sending Reset Password Email:', err);
    return false;
  }
};

module.exports = { sendOTPEmail, sendTicketEmail, resetPasswordEmailToken };