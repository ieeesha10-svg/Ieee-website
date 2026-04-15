const Submission = require('../models/SubmissionModel');
const Form = require('../models/FormModel');
const User = require('../models/UserModel');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');
const { nanoid } = require('nanoid');

// --- HELPER: Send Static Ticket Email (Fixed Image) ---
const sendTicketEmail = async (email, userName, ticketCode, eventTitle, qrImage) => {
  if (!process.env.EMAIL_USER) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // We strip the "data:image/png;base64," prefix for the attachment content
  const base64Data = qrImage.split("base64,")[1];

  const mailOptions = {
    from: `"IEEE Student Branch" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Confirmation of Registration – ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <p>Dear <strong>${userName}</strong>,</p>
        
        <p>This email is to confirm that we have received your registration for <strong>${eventTitle}</strong>.</p>
        
        <p>Please find your QR code attached below. Kindly ensure that you bring this QR code with you, as it is required for attendance and entry to the event.</p>
        
        <div style="margin: 20px 0; text-align: center;">
          <img src="cid:qr-code-image" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; padding: 5px;" />
          <p style="font-size: 14px; color: #555; font-family: monospace;">Ticket ID: ${ticketCode}</p>
        </div>

        <p>Should you have any questions or require further assistance, please do not hesitate to contact us.</p>
        
        <p>Best regards,<br>IEEE Team</p>
      </div>
    `,
    attachments: [{
      filename: 'ticket-qr.png',
      content: base64Data,
      encoding: 'base64',
      cid: 'qr-code-image' // <--- MATCHES THE HTML 'src'
    }]
  };

  await transporter.sendMail(mailOptions);
};

// ==========================================
// 1. STUDENT ACTIONS
// ==========================================

// @desc    Submit a form & Get Ticket
// @route   POST /api/submissions
// @access  Private
const submitForm = async (req, res) => {
  try {
    const { formId, answers } = req.body;
    
    // 1. Validate Form
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (!form.settings.isActive) return res.status(400).json({ message: 'Form is closed' });

    // 2. Check Expiry
    if (form.settings.expiryDate && new Date() > new Date(form.settings.expiryDate)) {
      return res.status(400).json({ message: 'Form expired' });
    }
    
    // 3. Check Duplicate Submission
    const existingSubmission = await Submission.findOne({ formId, userId: req.user._id });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this form.' });
    }

    // 4. Generate Ticket (If it's an Event)
    let ticketCode = null;
    let qrImage = null;

    if (form.type === 'event' || form.type === 'workshop') {
      ticketCode = nanoid(10); 
      qrImage = await QRCode.toDataURL(ticketCode);
    }

    // 5. Save Submission
    const submission = await Submission.create({
      formId,
      userId: req.user._id,
      registrantEmail: req.user.email,
      data: answers,
      ticketCode,
      attended: false
    });

    // 6. Send Email (Async)
    if (ticketCode && qrImage) {
      sendTicketEmail(
        req.user.email,
        req.user.name,
        ticketCode,
        form.title,
        qrImage
      ).catch(err => console.error("Email Error:", err));
    }

    res.status(201).json({ message: 'Submitted successfully', ticketCode });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================================
// 2. ADMIN / XCOM ACTIONS
// ==========================================

// @desc    Scan QR Code (Gatekeeper)
// @route   POST /api/submissions/scan
// @access  Private (Scanner/XCom)
const scanTicket = async (req, res) => {
  const { code } = req.body;

  try {
    const submission = await Submission.findOne({ ticketCode: code });
    if (!submission) return res.status(404).json({ message: 'Invalid Ticket!' });

    if (submission.attended) {
      return res.status(400).json({ 
        message: 'Already Scanned!', 
        lastScanned: submission.attendedAt 
      });
    }

    // Mark as Attended
    submission.attended = true;
    submission.attendedAt = Date.now();
    await submission.save();

    const user = await User.findById(submission.userId);
    res.json({ 
      success: true, 
      message: `Welcome, ${user ? user.name : 'Guest'}!`,
      registrant: user ? user.name : submission.registrantEmail
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Submissions (Table View)
// @route   GET /api/submissions?formId=...
// @access  Private (XCom/Board)
const getSubmissions = async (req, res) => {
  try {
    const { formId } = req.query;
    if (!formId) return res.status(400).json({ message: 'Form ID is required' });

    const submissions = await Submission.find({ formId })
      .populate('userId', 'name email phone university yearOfStudy')
      .sort('-createdAt');

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export Responses to Excel (Print Feature)
// @route   GET /api/submissions/export?formId=...
// @access  Private (XCom/Board)
const exportSubmissionsToExcel = async (req, res) => {
  try {
    const { formId } = req.query;
    if (!formId) return res.status(400).json({ message: 'Form ID is required' });

    // 1. Get Form & Submissions
    const form = await Form.findById(formId);
    const submissions = await Submission.find({ formId })
      .populate('userId', 'name email phone university')
      .sort('-createdAt');

    // 2. Setup Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Responses');

    // 3. Define Headers (Profile + Question Data)
    const columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Attended', key: 'attended', width: 10 },
      { header: 'Name', key: 'userName', width: 25 },
      { header: 'Email', key: 'userEmail', width: 30 },
      { header: 'Phone', key: 'userPhone', width: 15 }
    ];

    // Add columns dynamically based on Form questions
    form.structure.forEach(field => {
      if (['TextInput', 'TextArea', 'Dropdown', 'Checkbox'].includes(field.element)) {
        columns.push({ header: field.label || 'Question', key: field.id, width: 30 });
      }
    });

    worksheet.columns = columns;
    worksheet.getRow(1).font = { bold: true };

    // 4. Fill Data
    submissions.forEach(sub => {
      const rowData = {
        date: sub.createdAt.toISOString().split('T')[0],
        attended: sub.attended ? 'Yes' : 'No',
        userName: sub.userId?.name || 'Guest',
        userEmail: sub.registrantEmail,
        userPhone: sub.userId?.phone || '-'
      };
      // Merge Dynamic Answers
      if (sub.data) Object.assign(rowData, sub.data);
      
      worksheet.addRow(rowData);
    });

    // 5. Download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=responses_${formId}.xlsx`);
    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitForm, scanTicket, getSubmissions, exportSubmissionsToExcel };