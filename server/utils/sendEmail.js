const nodemailer = require('nodemailer');
const { getEmailFooter } = require('./emailTemplates');

const sendOTPEmail = async (recipientEmail, otpCode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
      }
    });

    const footerHtml = getEmailFooter();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2>Welcome to IEEE SHA!</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #00629B; letter-spacing: 5px;">${otpCode}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
      ${footerHtml}
    `;

    await transporter.sendMail({
      from: `"IEEE SHA Student Branch" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Verify Your Account - OTP',
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP Email:', error);
    return false;
  }
};

module.exports = sendOTPEmail;