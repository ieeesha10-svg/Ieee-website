const fs = require('fs').promises;
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const SystemSettings = require('../models/SystemSettings');
const { getEmailFooter } = require('../utils/emailTemplates');

// Helper: Sleep to avoid spam blocks
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @desc    Upload Excel & Send Bulk Emails
// @route   POST /api/emails/bulk-send
// @access  Private (XCom/Board)

const sendBulkEmails = async (req, res) => {
  // 1. CHECK FILES
  const excelFile = req.files['excelFile'] ? req.files['excelFile'][0] : null;
  const attachmentFiles = req.files['emailAttachments'] || []; // Array of files

  if (!excelFile) return res.status(400).json({ error: "No Excel file uploaded" });

  try {
    const { email: templateBody, subject } = req.body;
    
    // ... (Settings & Transporter logic - SAME AS BEFORE) ...
    // [Copy lines 20-30 from previous code]
    const settings = await SystemSettings.findById('global_settings');
    const emailUser = settings?.emailUser || process.env.EMAIL_USER;
    const emailPass = settings?.emailPass || process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) throw new Error("Email credentials missing.");
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
      pool: true, maxConnections: 5, maxMessages: 100
    });
    // ...

    // 2. PREPARE ATTACHMENTS
    // We map the uploaded files to Nodemailer's format
    const attachments = attachmentFiles.map(file => ({
      filename: file.originalname,
      path: file.path
    }));

    // 3. READ EXCEL
    const workbook = xlsx.readFile(excelFile.path);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    // Delete Excel immediately, but KEEP attachments until done
    await fs.unlink(excelFile.path); 

    const footerHtml = getEmailFooter();
    const sentList = [];
    const failedList = [];
    const logEntries = [];
    let quotaHit = false;

    // 4. SENDING LOOP
    for (const row of rawData) {
      if (quotaHit) break;

      const emailKey = Object.keys(row).find(k => k.toLowerCase() === 'email');
      const recipientEmail = row[emailKey];
      if (!recipientEmail) continue;

      let retries = 3;
      let isSent = false;
      let errorMsg = '';

      while (retries > 0) {
        try {
          // Dynamic Replacement
          let personalizedHtml = templateBody;
          Object.keys(row).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'gi');
            personalizedHtml = personalizedHtml.replace(regex, row[key] || '');
          });
          
          const finalHtml = personalizedHtml + footerHtml;

          await transporter.sendMail({
            from: `"IEEE SHA Student Branch" <${emailUser}>`,
            to: recipientEmail,
            subject: subject,
            html: finalHtml,
            attachments: attachments // <--- Standard Attachments
          });

          isSent = true;
          console.log(`✅ Sent to: ${recipientEmail}`);
          break;

        } catch (error) {
           errorMsg = error.message;
           if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
             quotaHit = true;
             errorMsg = "Quota Exceeded";
             retries = 0;
             break;
           }
           retries--;
           await sleep(1000);
        }
      }

      logEntries.push({ email: recipientEmail, state: isSent, err: isSent ? undefined : errorMsg });
      if (isSent) sentList.push(recipientEmail);
      else failedList.push({ email: recipientEmail, reason: errorMsg });

      if (quotaHit) break;
      await sleep(500);
    }

    // 5. CLEANUP ATTACHMENTS (Crucial Step)
    // Now that the loop is done, delete the attachment files from the server
    for (const file of attachmentFiles) {
      try { await fs.unlink(file.path); } catch(e) {}
    }

    // ... (Save DB Log & Return Response - SAME AS BEFORE) ...
    // [Copy Log creation and res.json from previous code]
    const log = await EmailLog.create({
      sentBy: req.user._id,
      sentFrom: 'Excel Upload',
      subject: subject,
      emails: logEntries,
      totalSent: sentList.length,
      totalFailed: failedList.length
    });

    res.status(quotaHit ? 429 : 200).json({
      message: quotaHit ? "Stopped early: Quota Exceeded" : "Batch complete",
      logId: log._id,
      stats: { success: sentList.length, failed: failedList.length },
      successful: sentList,
      failed: failedList
    });

  } catch (error) {
    // Error Cleanup
    if (excelFile) try { await fs.unlink(excelFile.path); } catch(e) {}
    if (attachmentFiles) {
        for (const file of attachmentFiles) try { await fs.unlink(file.path); } catch(e) {}
    }
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update System Settings
// @route   PUT /api/emails/settings
const updateEmailSettings = async (req, res) => {
  try {
    const { email, password } = req.body;
    const settings = await SystemSettings.findByIdAndUpdate(
      'global_settings',
      { emailUser: email, emailPass: password, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json({ message: "Settings updated", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Logs
// @route   GET /api/emails/logs
const getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find().populate('sentBy', 'name email').sort('-sendDate');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendBulkEmails, updateEmailSettings, getEmailLogs };