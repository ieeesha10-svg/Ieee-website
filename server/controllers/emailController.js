const fs = require('fs').promises;
const multer = require('multer');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
const SystemSettings = require('../models/SystemSettings');
const { getEmailFooter } = require('../utils/emailTemplates');
const validator = require('validator');

// Helper: Sleep to avoid spam blocks
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @desc    Upload Excel & Send Bulk Emails
// @route   POST /api/emails/bulk-send
// @access  Private (XCom/Board)
const sendBulkEmails = async (req, res) => {
  try {
    const file = req.file;
    const { bodyMessage } = req.body;

    if (!file || !bodyMessage) {
        return res.status(400).json({ error: 'File and message body are required' });
    }

    // Set headers for chunked response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Read the Excel file from memory
    // const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const workbook = xlsx.readFile(file.path);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // console.log(`Processing ${data.length} rows from the uploaded Excel file.`);

    // Delete the temporary file after reading
    if (file.path) {
        await fs.unlink(file.path);
    }

    const validEmails = [];

    for (let i = 0; i < data.length; i++) {
        const email = data[i][0];

        // if (i === 0 && email && String(email).toLowerCase().includes('email')) {
        //     continue; // Skip header row if it contains 'email'
        // }

        if (email) {
            const emailStr = String(email).trim();
            
            if (validator.isEmail(emailStr)) {
                validEmails.push(emailStr);
            } else {
                // for invalid 
                await EmailLog.create({
                    email: emailStr,
                    status: 'Not email',
                    messageBody: bodyMessage
                });
                const responseChunk = { email: emailStr, status: 'Not email' };
                res.write(JSON.stringify(responseChunk) + '\n');
            }
        }
    }

    // send emails to validEmails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
      }
    });


    for (const email of validEmails) {
        try {
            await transporter.sendMail({
                from: `"IEEE" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Notification',
                text: bodyMessage
            });
            // Log the successful email send to the database
            await EmailLog.create({
                email: email,
                status: 'Done',
                messageBody: bodyMessage
            });
            // for successful email
            const successChunk = { email: email, status: 'Done' };
            res.write(JSON.stringify(successChunk) + '\n');
        } catch (err) {
            // for failed email
            await EmailLog.create({
                email: email,
                status: 'Rejected',
                messageBody: bodyMessage
            });
            const failChunk = { email: email, status: 'Rejected' };
            res.write(JSON.stringify(failChunk) + '\n');
        }

        // Wait for 1 second before sending the next email to avoid spam filters
        await sleep(1000);
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
    
    const skip = (page - 1) * limit;

    const emails = await EmailLog.find()
      .sort({ sentAt: -1 }) // sort by most recent first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalEmails = await EmailLog.countDocuments();
    const totalPages = Math.ceil(totalEmails / limit);

    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        totalItems: totalEmails,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
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