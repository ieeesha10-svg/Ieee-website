const Submission = require('../models/SubmissionModel');
const Form = require('../models/FormModel');
const User = require('../models/UserModel');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const {sendTicketEmail}=require('../utils/sendEmail');
//const nodemailer = require('nodemailer');
const { nanoid } = require('nanoid');
const { catchAsync, AppError } = require('../middleware/errorsMiddleware');

// --- HELPER: Send Static Ticket Email (Fixed Image) ---

/** //added send ticket email handeler in utils/sendEmail.js//
 * 
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

    //added html in veiw/emails_Template//

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
};*/

// ==========================================
// 1. STUDENT ACTIONS
// ==========================================

// @desc    Submit a form & Get Ticket
// @route   POST /api/submissions
// @access  Private
const submitForm = catchAsync(async (req, res) => {
  const { formId, answers } = req.body;
  if (!formId || !answers) {
    throw new AppError('Form ID and answers are required', 400);
  }
  // 1. Validate Form
  const form = await Form.findById(formId);
  if (!form) throw new AppError('Form not found', 404);
  
  // 2. Check Expiry
  if (form.status !== "Active" || form.endDate < new Date()) {
    throw new AppError('This form is currently closed', 400);
  }
  // 3. Check max submissions
  const submissionsCount = await Submission.countDocuments({ formId });
  
  if (submissionsCount >= form.maxSubmissions) {
    throw new AppError('Maximum submissions reached', 400);
  }
  
  // 4. Prevent duplicate submissions
  const existingSubmission = await Submission.findOne({
    formId,
    userId: req.user._id
  });
  
  if (existingSubmission) {
    throw new AppError('You already submitted this form', 400);
  }
  
  // 5. Generate Ticket (If it's an Event)
  ticketCode = `${formId}-${form.type}-${req.user._id}-${nanoid(6)}`;
  qrImage = await QRCode.toDataURL(ticketCode);

  // 6. Save Submission
  const submission = await Submission.create({
    formId,
    userId: req.user._id,
    registrantEmail: req.user.email,
    answers,
    ticketCode,
    qrImage
  });

  // 7. Send Email (Async)
  if (ticketCode && qrImage) {
    //email sending handle in utils/sendEmail//
    sendTicketEmail(
      req.user.email,
      req.user.name,
      ticketCode,
      form.title,
      qrImage
    ).catch(err => console.error("Email Error:", err));
  }

  res.status(201).json({ message: 'Submitted successfully', ticketCode });
});

// ==========================================
// 2. ADMIN / XCOM ACTIONS
// ==========================================

// @desc    Scan QR Code (Gatekeeper)
// @route   POST /api/submissions/scan
// @access  Private (Scanner/XCom)
const scanTicket = catchAsync(async (req, res) => {
  const { code } = req.body;

  try {
    const submission = await Submission.findOne({ ticketCode: code });
    if (!submission) throw new AppError('Invalid Ticket!', 404);

    if (submission.attended) {
      throw new AppError('Already Scanned!', 400);
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
});

// @desc    Get All Submissions (Table View)
// @route   GET /api/submissions?formId=...
// @access  Private (XCom/Board)

// const getSubmissions = catchAsync(async (req, res) => {
//   const { formId } = req.query;
//   if (!formId) return res.status(400).json({ message: 'Form ID is required' });

//   const submissions = await Submission.find({ formId })
//     .populate('userId', 'name email phone university yearOfStudy')
//     .sort('-createdAt');

//   res.json(submissions);
// });

// @desc    Export Responses to Excel (Print Feature)
// @route   GET /api/submissions/export?formId=...
// @access  Private (XCom/Board)
const exportSubmissionsToExcel = catchAsync(async (req, res) => {
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
      if (sub.answers) Object.assign(rowData, sub.answers);
      
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
});

// @desc    Get single submission
// @route   GET /api/submission/:formid/:userid
// @access  Private
const getSubmission = catchAsync(async (req, res) => {
  const { formid, userid } = req.params;
  const submission = await Submission.findOne({ formId: formid, userId: userid });
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }
  res.json(submission);
});


// // @desc    Get all submissions
// // @route   GET /api/submission
// // @access  Private (Admin)
const getSubmissions = catchAsync(async (req, res) => {

  const [result] = await Submission.aggregate([
    {
      $facet: {

        submissions: [
          { $sort: { createdAt: -1 } }
        ],

        totalCount: [
          { $count: "count" }
        ],

        pendingCount: [
          { $match: { status: "pending" } },
          { $count: "count" }
        ],

        approvedCount: [
          { $match: { status: "approved" } },
          { $count: "count" }
        ],

        rejectedCount: [
          { $match: { status: "rejected" } },
          { $count: "count" }
        ],

        attendedCount: [
          { $match: { status: "attended" } },
          { $count: "count" }
        ]
      }
    }
  ]);

  const submissions = await Submission.populate(
    result.submissions,
    [
      {
        path: 'formID',
        select: 'title type'
      },
      {
        path: 'userID',
        select: 'name email'
      }
    ]
  );

  const totalCount = result.totalCount[0]?.count || 0;

  const pendingCount = result.pendingCount[0]?.count || 0;

  const approvedCount = result.approvedCount[0]?.count || 0;

  const rejectedCount = result.rejectedCount[0]?.count || 0;

  const attendedCount = result.attendedCount[0]?.count || 0;

  res.json({
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    attendedCount,
    submissions
  });
});


// // @desc    Edit submission
// // @route   PUT /api/submission/:id
// // @access  Private (Admin)
const editSubmission = catchAsync(async (req, res) => {

  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  const {
    status,
    answers
  } = req.body;

  if (status) {
    submission.status = status;
  }

  if (answers) {
    submission.answers = answers;
  }

  await submission.save();

  res.json(submission);
});

module.exports = { submitForm, scanTicket, getSubmissions, getSubmission, editSubmission, exportSubmissionsToExcel };