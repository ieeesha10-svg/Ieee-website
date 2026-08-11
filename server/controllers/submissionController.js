const Submission = require('../models/SubmissionModel');
const Form = require('../models/FormModel');
const User = require('../models/UserModel');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const {sendTicketEmail}=require('../utils/sendEmail');
const { nanoid } = require('nanoid');
const { catchAsync, AppError } = require('../middleware/errorsMiddleware');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// ==========================================
// 1. STUDENT ACTIONS
// ==========================================

// @desc    Submit a form & Get Ticket
// @route   POST /api/submissions
// @access  Private
const submitForm = catchAsync(async (req, res) => {
  const userid = req.user._id;
  const user = await User.findById(userid);
  const { formId } = req.body;
  let answers = req.body.answers;
  
  if (!userid || !user) {
    throw new AppError('User not found', 404);
  }
  
  if (!formId || !answers) {
    throw new AppError('Form ID and answers are required', 400);
  }
  // 1. extract answers from the request body
  // console.log(JSON.parse(answers));

  if (typeof answers === 'string') {
    try {
      answers = JSON.parse(answers);
    } catch (err) {
      throw new AppError('Invalid answers format, must be valid JSON', 400);
    }
  }

  // 2. Validate Form
  const form = await Form.findById(formId);
  if (!form) throw new AppError('Form not found', 404);
  
  // 3. Check Expiry
  if (form.status !== "Active" || new Date(form.endDate).setHours(23,59,59,999) < new Date()) {
    throw new AppError('This form is currently closed', 400);
  }
  
  // 4. Check max submissions
  const submissionsCount = await Submission.countDocuments({ formId });
  if (submissionsCount >= form.maxSubmissions) {
    throw new AppError('Maximum submissions reached', 400);
  }
  
  // 5. Prevent duplicate submissions
  const existingSubmission = await Submission.findOne({
    formId,
    userId: userid
  });
  
  if (existingSubmission) {
    throw new AppError('You already submitted this form', 400);
  }

  // 6. upload files to cloudinary
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const folderPath = `submissions/${formId}`;
      const fileUrl = await uploadToCloudinary(file.buffer, folderPath, file.mimetype, file.originalname);
      
      answers[file.fieldname] = fileUrl;
    }
  }

  // 7. Generate Ticket (ONLY if it's a registration form)
  let ticketCode;
  let qrImage;
  
  if (form.type === "registration") {
    ticketCode = `${formId}-${userid}-${nanoid(6)}`;
    qrImage = await QRCode.toDataURL(ticketCode);
  }
  
  // 8. Save Submission
  const newSubmission = new Submission({
    formId,
    userId: userid,
    registrantEmail: req.user.email,
    answers,
    // use spread operator to add ticketCode and qrImage to the newSubmission object if form type is registration
    ...(ticketCode && { ticketCode }),
    ...(qrImage && { qrImage })
  });

  try {
    await newSubmission.save();
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new AppError(`Submission failed validation: ${error.message}`, 400);
    }
    if (error.code === 11000) {
      throw new AppError('You already submitted this form', 400);
    }
    throw new AppError(`Submission failed: ${error.message}`, 500);
  }

  // 9. Send Email (Async)
  if (form.type === "registration" && ticketCode && qrImage) {
    sendTicketEmail({
      email: req.user.email,
      userName: req.user.name,
      ticketCode,
      eventTitle: form.title
    }).catch(err => console.error("Email Error:", err));
  }

  // 10. Send Response
  res.status(201).json({ 
    status: 'success', 
    message: 'Submitted successfully', 
    ...(ticketCode && { ticketCode }),
    data: newSubmission 
  });
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
    submission.status = "attended";
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

// @desc    Export Responses to Excel (Print Feature)
// @route   GET /api/submissions/export?formId=...
// @access  Private (XCom/Board)
const exportSubmissionsToExcel = catchAsync(async (req, res) => {
  try {
    const { formId } = req.params;
    if (!formId) return res.status(400).json({ message: 'Form ID is required' });
    
    // 1. Get Form & Submissions
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found in database' });
    }
    const submissions = await Submission.find({ formId })
      .populate('userId', 'name email phone university college yearOfStudy position organization')
      .sort('-createdAt')
      .lean();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for this form' });
    }

    // 2. Setup Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Responses');

    // Helper: format a Date as YYYY-MM-DD (local time)
    const formatDate = (date) => {
      if (!date) return '-';
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    // Helper: format a Date as HH:mm (time in hours, local time)
    const formatTime = (date) => {
      if (!date) return '-';
      const d = new Date(date);
      // 12 hour format
      return `${String(d.getHours() % 12 || 12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
      // 24 hour format
      // return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    // 3. Define Headers (User Info + Question Data)
    const userInfoColumns = [
      { header: 'User ID', key: 'userId', width: 28 },
      { header: 'Submitted Date', key: 'date', width: 15 },
      { header: 'Submitted Time', key: 'time', width: 12 },
      { header: 'Attended', key: 'attended', width: 10 },
      { header: 'Attended Time', key: 'attendedTime', width: 12 },
      { header: 'Name', key: 'userName', width: 25 },
      { header: 'Email', key: 'userEmail', width: 30 },
      { header: 'Phone', key: 'userPhone', width: 15 },
      { header: 'Position', key: 'userPosition', width: 15 },
      { header: 'Organization', key: 'userOrganization', width: 20 },
      { header: 'University', key: 'userUniversity', width: 25 },
      { header: 'College', key: 'userCollege', width: 25 },
      { header: 'Year of Study', key: 'userYearOfStudy', width: 12 },
      { header: 'Status', key: 'status', width: 12 }
    ];

    // Add columns dynamically based on Form questions
    const answerColumns = [];
    if (form.fields && Array.isArray(form.fields)) {
      form.fields.forEach(field => {
        answerColumns.push({ header: field.label || 'Question', key: field.id, width: 30 });
      });
    }

    const columns = [...userInfoColumns, ...answerColumns];
    worksheet.columns = columns.map(col => ({ key: col.key, width: col.width }));

    // --- Section header row (row 1): user info vs answers ---
    const sectionRow = worksheet.getRow(1);
    sectionRow.height = 28;

    const userInfoCell = sectionRow.getCell(1);
    userInfoCell.value = 'User Information';
    userInfoCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    userInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    userInfoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.mergeCells(1, 1, 1, userInfoColumns.length);

    if (answerColumns.length > 0) {
      const answersCell = sectionRow.getCell(userInfoColumns.length + 1);
      answersCell.value = "User's Answers";
      answersCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      answersCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } };
      answersCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(1, userInfoColumns.length + 1, 1, columns.length);
    }

    // --- Column header row (row 2): bold + colored background ---
    const headerRow = worksheet.getRow(2);
    columns.forEach((col, i) => {
      headerRow.getCell(i + 1).value = col.header;
    });
    headerRow.height = 20;
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF9DC3E6' } },
        left: { style: 'thin', color: { argb: 'FF9DC3E6' } },
        bottom: { style: 'thin', color: { argb: 'FF9DC3E6' } },
        right: { style: 'thin', color: { argb: 'FF9DC3E6' } }
      };
    });

    // 4. Fill Data
    submissions.forEach(sub => {
      const rowData = {
        userId: sub.userId?._id?.toString() || '-',
        date: formatDate(sub.createdAt),
        time: formatTime(sub.createdAt),
        attended: sub.attended ? 'Yes' : 'No',
        attendedTime: formatTime(sub.attendedAt),
        userName: sub.userId?.name || 'Guest',
        userEmail: sub.registrantEmail || sub.userId?.email || '-',
        userPhone: sub.userId?.phone || '-',
        userPosition: sub.userId?.position || '-',
        userOrganization: sub.userId?.organization || '-',
        userUniversity: sub.userId?.university || '-',
        userCollege: sub.userId?.college || '-',
        userYearOfStudy: sub.userId?.yearOfStudy ?? '-',
        status: sub.status || '-'
      };

      // Merge Dynamic Answers & Handle Arrays (like Checkboxes)
      if (sub.answers) {
        const processedAnswers = {};
        for (const [key, value] of Object.entries(sub.answers)) {
          if (Array.isArray(value)) {
            processedAnswers[key] = value.join(' - ');
          } else {
            processedAnswers[key] = value;
          }
        }
        Object.assign(rowData, processedAnswers);
      }
      
      worksheet.addRow(rowData);
    });

    // 5. Download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=responses_${formId}.xlsx`);
    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    console.error("Excel Export Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single submission
// @route   GET /api/submission/:formid/:userid
// @access  Private
const getUserSubmission = catchAsync(async (req, res) => {
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

        // attended and not attended
        attendedCount: [
          { $match: { attended: true } },
          { $count: "count" }
        ],

        notAttendedCount: [
          { $match: { attended: false } },
          { $count: "count" }
        ],
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


const getSubmissionsForForm = catchAsync(async (req, res) => {
  const { formId } = req.params;
  const submissions = await Submission.find({ formId }).populate('userId', 'name email');

  res.json({total : submissions.length, submissions});
});

const downloadFile = catchAsync(async (req, res) => {
  const { url } = req.query;
  if (!url) throw new AppError('URL is required', 400);

  const response = await fetch(decodeURIComponent(url), { redirect: 'follow' });
  if (!response.ok) throw new AppError('File not found', 404);

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const contentDisp = response.headers.get('content-disposition');

  res.setHeader('Content-Type', contentType);
  if (contentDisp) {
    res.setHeader('Content-Disposition', contentDisp);
  } else {
    res.setHeader('Content-Disposition', 'attachment');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  res.send(buffer);
});

module.exports = {
  submitForm,
  scanTicket,
  getUserSubmission,
  getSubmissions,
  getSubmissionsForForm,
  editSubmission,
  exportSubmissionsToExcel,
  downloadFile,
};


/*
* Naming error during `populate` (in the `getSubmissions` function): You are attempting to call `populate` using uppercase formID and userID: `path: ‘formID’` and `path: ‘userID’`, whereas in the `SubmissionModel` schema, you named them in lowercase: `formId` and `userId`. This will cause the data retrieval to fail, and neither the form name nor the user name will be displayed.
* Excel export error (exportSubmissionsToExcel function): You are using form.structure.forEach(...) to retrieve the questions and checking field.element. However, in the FormModel we created earlier, the field is named fields, not structure, and the type is registered under type, not element. Required fix: Change it to form.fields.forEach and use field.type.
* The `attendedAt` field is disabled: In the `scanTicket` function, you are logging the attendance time: `submission.attendedAt = Date.now();`. However, in `submissionSchema`, the field `// attendedAt: Date` is commented out. You must enable it in the schema so that it is saved to the database.
* Missing routes in submissionRouter.js: You’ve written two functions in the Controller—`getSubmission` (to retrieve a single submission) and `editSubmission` (to update a submission’s status)—but you completely forgot to add them to the Router file.
* Generating tickets for everything (logically): The current code generates a ticketCode and a qrImage and sends a QR email for any form that is filled out (whether it’s an Event, a volunteer request, or a survey). You may need to add a condition to generate tickets only if `form.type` is related to an event (Event/Workshop).
*/