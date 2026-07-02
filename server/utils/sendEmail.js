const nodemailer = require('nodemailer');
const { getEmailFooter } = require('./emailTemplates');
const fs=require('fs');
const htmlToText=require('html-to-text');
const  path  = require('path');

const getTransport=()=>nodemailer.createTransport({
  service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
      }
});
// load html templates
const loadTemplate=(templateName)=>{
  return fs.readFileSync(
    path.join(__dirname,'../view/emails_Templates',templateName),'utf-8'
  )
}

// OTP email
const sendOTPEmail = async (recipientEmail, otpCode) => {
  try {
    let html=loadTemplate('sendOTP.html');
    html=html.replace('{{otpCode}}',otpCode);
    html+=getEmailFooter();
    await getTransport().sendMail({
      from: `"IEEE SHA Student Branch" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Verify Your Account - OTP',
      html
    })
    return true;
}
catch(err){
  console.log('Error sending OTP Email:',err);
  return false;
}
};

// Ticket email for submission controller
const sendTicketEmail=async(email,userName,ticketCode,eventTitle,qrImage)=>{
  try{
    const base64Data=qrImage.split('base64,')[1];
    let html=loadTemplate('ticketEmail.html');
    html=html.replace('{{userName}}',userName)
    .replace('{{eventTitle}}',eventTitle)
    .replace('{{ticketCode}}',ticketCode);
    html+=getEmailFooter();
    await getTransport().sendMail({
       from:`"IEEE SHA Student Branch" <${process.env.EMAIL_USER}>`,
       to:email,
       subject:`Confirmation of Registration – ${eventTitle}`,
       html,
       attachments:[{
        filename:'ticket-qr.png',
        content:base64Data,
        encoding:'base64',
        cid:'qr-code-image'
       }]
    });
    return true
  }
  catch(err){
    console.error('Error sending Ticket Email:',err);
    return false;
  }
};

const resetPasswordEmailToken = async (recipientEmail, resetToken) => {
  try {
    let html=loadTemplate('resetPassword.html');
    html=html.replace('{{resetToken}}',resetToken);
    html+=getEmailFooter();
    await getTransport().sendMail({
      from: `"IEEE SHA Student Branch" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Reset Your Password',
      html
    })
    return true;
  }
  catch(err){
    console.log('Error sending Reset Password Email:',err);
    return false;
  }
};


module.exports = {sendOTPEmail,sendTicketEmail,resetPasswordEmailToken};