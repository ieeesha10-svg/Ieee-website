const fs = require('fs').promises;
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const SystemSettings = require('../models/SystemSettings');
const { getEmailFooter } = require('../utils/emailTemplates');
const validator = require('validator');
const { Resend } = require('resend');

// Helper: Sleep to avoid spam blocks
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @desc    Upload Excel & Send Bulk Emails
// @route   POST /api/emails/bulk-send
// @access  Private (XCom/Board)

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBulkEmails = async (req, res) => {
  try {
    const userId = req.user._id;
    if(!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }
    
    const file = req.files && req.files['excelFile'] ? req.files['excelFile'][0] : req.file;
    const attachmentFiles = req.files && req.files['attachments'] ? req.files['attachments'] : [];
    const { email: bodyMessage, subject } = req.body;

    if (!file || !bodyMessage) {
        return res.status(400).json({ error: 'File and message body are required' });
    }

    // Set headers for chunked response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Read the Excel file
    const workbook = xlsx.readFile(file.path);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    // header: 1 returns an array of arrays
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Delete the temporary file after reading
    if (file.path) {
        await fs.unlink(file.path);
    }

    const validEmails = [];
    const mailAttachments = [];
    
    for (const att of attachmentFiles) {
        try {
            const fileBuffer = await fs.readFile(att.path);
            mailAttachments.push({
                filename: att.originalname,
                content: fileBuffer 
            });
        } catch (err) {
            console.error("Error reading attachment:", err);
        }
    }

    if (data.length > 0) {
        // Extract titles from the first line (ignore extra spaces)
        const headers = data[0].map(h => h ? String(h).trim() : '');

        // The loop starts at 1 so we can skip the first row (the header row).
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const emailCell = row[0]; // The first column is always the email address

            if (emailCell) {
                const emailStr = String(emailCell).trim();

                if (validator.isEmail(emailStr)) {
                    // Collect the rest of the row data and link it to the headers
                    const rowData = {};
                    for (let j = 0; j < headers.length; j++) {
                        if (headers[j]) {
                            rowData[headers[j]] = row[j] !== undefined ? String(row[j]).trim() : '';
                        }
                    }
                    validEmails.push({ email: emailStr, data: rowData });
                } else {
                    // for invalid email
                    await EmailLog.create({
                        sendBy: userId,
                        email: emailStr,
                        subject: subject || 'Notification',
                        status: 'Not email',
                        messageBody: bodyMessage
                    });
                    const responseChunk = { email: emailStr, status: 'Not email' };
                    res.write(JSON.stringify(responseChunk) + '\n');
                }
            }
        }
    }

    for (const recipient of validEmails) {
        const { email, data: rowData } = recipient;

        // Replace the [variable] placeholders with their corresponding values from Excel
        const personalizedHtmlMessage = bodyMessage.replace(/\[(.*?)\]/g, (match, placeholder) => {
            // Search for a column name without distinguishing between uppercase and lowercase letters (case-insensitive)
            const headerKey = Object.keys(rowData).find(
                key => key.toLowerCase() === placeholder.toLowerCase()
            );

            // If the column exists and has a value, replace the word with that value... If it doesn't exist, leave it as is
            if (headerKey !== undefined && rowData[headerKey] !== '') {
                return rowData[headerKey];
            }
            return match; // Leave it as is, like [name] or [phone]
        });

        try {
            const SENDER_EMAIL = 'IEEE SHA Student Branch <noreply@ieeesha.org>';
            const { data: resendData, error: resendError } = await resend.emails.send({
                from: SENDER_EMAIL,
                to: email,
                subject: subject || 'Notification',
                html: personalizedHtmlMessage,
                attachments: mailAttachments
            });

            if (resendError) {
                throw new Error(resendError.message);
            }

            // Log the successful email send to the database
            await EmailLog.create({
                sendBy: userId,
                email: email,
                subject: subject || 'Notification',
                status: 'Done',
                messageBody: personalizedHtmlMessage
            });
            
            // for successful email
            const successChunk = { email: email, status: 'Done' };
            res.write(JSON.stringify(successChunk) + '\n');
        } catch (err) {
            console.error(`Resend Error for ${email}:`, err.message);
            
            // for failed email
            await EmailLog.create({
                sendBy: userId,
                email: email,
                subject: subject || 'Notification',
                status: 'Rejected',
                messageBody: personalizedHtmlMessage
            });
            const failChunk = { email: email, status: 'Rejected' };
            res.write(JSON.stringify(failChunk) + '\n');
        }

        // Wait for 1 second before sending the next email to avoid spam filters
        await sleep(1000);
    }

    for (const att of attachmentFiles) {
        if (att.path) {
            await fs.unlink(att.path).catch(e => console.error("Error deleting attachment:", e));
        }
    }

    res.write(JSON.stringify({ message: "Process Completed" }) + '\n');
    res.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
    } else {
        res.write(JSON.stringify({ error: 'Process interrupted due to server error' }) + '\n');
        res.end();
    }
  }
};

const getPaginatedEmails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    const skip = (page - 1) * limit;

    const filterQuery = {};
    if (status) {
      filterQuery.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const emails = await EmailLog.find(filterQuery)
      .sort({ sentAt: -1 }) // sort by most recent first
      .skip(skip)
      .limit(limit);

    const totalFilteredEmails = await EmailLog.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalFilteredEmails / limit);

    const totalEmails = await EmailLog.countDocuments(); 
    const totalDone = await EmailLog.countDocuments({ status: 'Done'});
    const totalRejected = await EmailLog.countDocuments({ status: 'Rejected' });
    const totalNotEmail = await EmailLog.countDocuments({ status: 'Not email' });

    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        totalItems: totalFilteredEmails, 
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
      },
      stats: {
        totalAll: totalEmails,
        totalDone: totalDone,
        totalRejected: totalRejected,
        totalNotEmail: totalNotEmail
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch emails' });
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

module.exports = { sendBulkEmails, updateEmailSettings, getEmailLogs, getPaginatedEmails };