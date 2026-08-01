const fs = require('fs').promises;
const xlsx = require('xlsx');
const validator = require('validator');
const mongoose = require('mongoose');
const EmailLog = require('../models/EmailLog');
const User = require('../models/UserModel');
const { sendBulkEmails } = require('../utils/sendEmail');

const cleanupFiles = async (files = []) => {
  for (const file of files) {
    if (file && file.path) {
      await fs.unlink(file.path).catch(e => console.error('Error deleting file:', e));
    }
  }
};

// @desc    Upload Excel & Send Bulk Emails
// @route   POST /api/emails/bulk-send
// @access  Private (XCom/Board)
const sendBulkEmailsFromExcel = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
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

    const recipients = [];

    if (data.length > 0) {
      // Extract titles from the first line (ignore extra spaces)
      const headers = data[0].map(h => h ? String(h).trim() : '');

      // The loop starts at 1 so we can skip the first row (the header row).
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const emailCell = row[0]; // The first column is always the email address

        if (!emailCell) continue;

        const emailStr = String(emailCell).trim();

        if (!validator.isEmail(emailStr)) {
          await EmailLog.create({
            sendBy: userId,
            email: emailStr,
            subject: subject || 'Notification',
            status: 'Not email',
            messageBody: bodyMessage
          });
          res.write(JSON.stringify({ email: emailStr, status: 'Not email' }) + '\n');
          continue;
        }

        // Collect the rest of the row data and link it to the headers
        const rowData = {};
        for (let j = 0; j < headers.length; j++) {
          if (headers[j]) {
            rowData[headers[j]] = row[j] !== undefined ? String(row[j]).trim() : '';
          }
        }

        recipients.push({ email: emailStr, data: rowData });
      }
    }

    await sendBulkEmails({
      recipients,
      subject,
      messageBody: bodyMessage,
      attachments: attachmentFiles,
      sendBy: userId,
      onResult: (result) => res.write(JSON.stringify(result) + '\n')
    });

    await cleanupFiles(attachmentFiles);

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
    const totalDone = await EmailLog.countDocuments({ status: 'Done' });
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

// @desc    Send Bulk Emails from Database to specific Users/Emails
// @route   POST /api/emails/bulk-send-db
// @access  Private (XCom/Board)
const sendBulkEmailsFromDB = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    const attachmentFiles = req.files && req.files['attachments'] ? req.files['attachments'] : [];
    const { email: bodyMessage, subject, userIds, emails } = req.body;

    if (!bodyMessage) {
      return res.status(400).json({ error: 'Message body is required' });
    }

    let targetUserIds = [];
    let targetEmails = [];

    try {
      if (userIds) targetUserIds = JSON.parse(userIds);
      if (emails) targetEmails = JSON.parse(emails);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid format for userIds or emails. Must be a JSON array.' });
    }

    const validUserIds = [];
    const invalidUserIds = [];

    targetUserIds.forEach(id => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        validUserIds.push(id);
      } else {
        invalidUserIds.push(id);
      }
    });

    if (validUserIds.length === 0 && targetEmails.length === 0) {
      return res.status(400).json({ error: 'No valid userIds or emails provided to search.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const queryConditions = [];
    if (validUserIds.length > 0) {
      queryConditions.push({ _id: { $in: validUserIds } });
    }
    if (targetEmails.length > 0) {
      queryConditions.push({ email: { $in: targetEmails } });
    }

    const query = { $or: queryConditions };
    const users = await User.find(query).lean();

    for (const id of invalidUserIds) {
      res.write(JSON.stringify({ email: `ID: ${id}`, status: 'Invalid ID Format' }) + '\n');
    }

    const foundUserIds = users.map(u => u._id.toString());
    const foundEmails = users.map(u => u.email);

    for (const id of validUserIds.filter(id => !foundUserIds.includes(id))) {
      res.write(JSON.stringify({ email: `ID: ${id}`, status: 'Not found in DB' }) + '\n');
    }

    for (const email of targetEmails.filter(email => !foundEmails.includes(email))) {
      res.write(JSON.stringify({ email, status: 'Not found in DB' }) + '\n');
    }

    if (users.length === 0) {
      res.write(JSON.stringify({ message: "Process Completed (No valid users found)" }) + '\n');
      return res.end();
    }

    const recipients = [];
    for (const user of users) {
      const emailStr = user.email ? String(user.email).trim() : '';

      if (!emailStr || !validator.isEmail(emailStr)) {
        await EmailLog.create({
          sendBy: userId,
          email: emailStr || `ID: ${user._id}`,
          status: 'Not email',
          messageBody: bodyMessage
        });
        res.write(JSON.stringify({ email: emailStr || `ID: ${user._id}`, status: 'Not email' }) + '\n');
        continue;
      }

      recipients.push({ email: emailStr, data: user });
    }

    await sendBulkEmails({
      recipients,
      subject,
      messageBody: bodyMessage,
      attachments: attachmentFiles,
      sendBy: userId,
      onResult: (result) => res.write(JSON.stringify(result) + '\n')
    });

    await cleanupFiles(attachmentFiles);

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

module.exports = { sendBulkEmailsFromExcel, sendBulkEmailsFromDB, getPaginatedEmails };
