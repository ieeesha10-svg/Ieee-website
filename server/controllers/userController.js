const User = require('../models/UserModel');
const Submission = require('../models/SubmissionModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const sendOTPEmail = require('../utils/sendEmail.js')
// --- HELPER: Generate JWT Token ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please check your email for the OTP.' 
      });
    }

    const token = generateToken(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // HTTPS in production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      committee: user.committee
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out' });
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user is set by the 'protect' middleware
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    university: req.user.university,
    committee: req.user.committee
  };
  res.json(user);
};

// ==========================================
// 2. REGISTRATION MODULE
// ==========================================

// @desc    Register a new user (Public Sign Up)
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, 
      phone, age, university, college, yearOfStudy, interests, committee, optionalData,
      role // User can request a role
    } = req.body;

    const userExists = await User.findOne({email : email.toLowerCase()});
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // --- SECURITY: Role Sanitization ---
    // Allow 'member' selection, but force everyone else to 'user'
    // This prevents hackers from creating an 'xcom' account via public API
    let finalRole = 'user';
    if (role === 'member') {
      finalRole = 'member';
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      otp,
      otpExpires,
      phone, age, university, college, yearOfStudy, interests, committee, optionalData
    });

    const emailSent = await sendOTPEmail(user.email, otp);

    if (!emailSent) {
      return res.status(500).json({ error: "User registered, but failed to send OTP email." });
    }

    res.status(201).json({ 
        message: "Registration successful. Please check your email for the OTP.",
        email: user.email
      });
    // if (user) {
    //   // Optional: Auto-login
    //   // const token = generateToken(user._id);
    //   // res.cookie('jwt', token, ...);

    //   res.status(201).json({
    //     _id: user.id,
    //     name: user.name,
    //     email: user.email,
    //     role: user.role,
    //   });
    // } else {
    //   res.status(400);
    //   throw new Error('Invalid user data');
    // }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Please provide email and OTP" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account is already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully! You can now login." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc    Create a privileged user (Board, XCom, Scanner)
// @route   POST /api/users/create-internal
// @access  Private (XCom Only)
const createUser = async (req, res) => {
  const { name, email, password, role, committee } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Validate Allowed Roles
  const allowedRoles = ['board', 'xcom', 'scanner', 'member'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Use register for normal users.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    committee // Optional, for assigning Board members to committees
  });

  res.status(201).json({
    message: `Success! Created new ${role}.`,
    user: { id: user._id, name: user.name, role: user.role }
  });
};

// ==========================================
// 3. ADMIN MANAGEMENT MODULE
// ==========================================

// @desc    Get all users (Advanced Filtering for Email Sender)
// @route   GET /api/users
// @access  Private (XCom/Board)
const getUsers = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'formId', 'attendedOnly'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // --- A. FORM PARTICIPATION LOGIC ---
    if (req.query.formId) {
      const submissionQuery = { formId: req.query.formId };
      
      // Filter by Attendance (Scanned users only)
      if (req.query.attendedOnly === 'true') {
        submissionQuery.attended = true;
      }
      
      const submissions = await Submission.find(submissionQuery).select('registrantEmail');
      const registrantEmails = submissions.map(sub => sub.registrantEmail);
      
      // Filter Users by these emails
      queryObj.email = { $in: registrantEmails };
    }

    // --- B. SEARCH LOGIC (Name or Email) ---
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      // Use $and if email filter already exists to avoid overwriting
      if (queryObj.email) {
        queryObj.$and = [
          { $or: [{ name: searchRegex }, { email: searchRegex }] }
        ];
      } else {
        queryObj.$or = [{ name: searchRegex }, { email: searchRegex }];
      }
    }

    // --- C. ROLE LOGIC (Multi-select) ---
    if (req.query.role) {
      const roles = req.query.role.split(',');
      queryObj.role = { $in: roles };
    }

    // --- BUILD QUERY ---
    let query = User.find(queryObj);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default: Newest first
    }

    // Field Limiting (Excel Export)
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-password');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1000;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // EXECUTE
    const users = await query;
    const count = await User.countDocuments(queryObj);

    res.json({ 
      users, 
      total: count, 
      page, 
      pages: Math.ceil(count / limit) 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Export Users to Excel (matches current filters)
// @route   GET /api/users/export
// @access  Private (Admin/XCom)
const exportUsersToExcel = async (req, res) => {
  try {
    // 1. REUSE THE FILTER LOGIC
    // (Exact same logic as getUsers, but we removed Pagination)
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'formId', 'attendedOnly'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Form/Event Filters
    if (req.query.formId) {
      const submissionQuery = { formId: req.query.formId };
      if (req.query.attendedOnly === 'true') {
        submissionQuery.attended = true;
      }
      const submissions = await Submission.find(submissionQuery).select('registrantEmail');
      const registrantEmails = submissions.map(sub => sub.registrantEmail);
      queryObj.email = { $in: registrantEmails };
    }

    // Search Filters
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      if (queryObj.email) {
        queryObj.$and = [{ $or: [{ name: searchRegex }, { email: searchRegex }] }];
      } else {
        queryObj.$or = [{ name: searchRegex }, { email: searchRegex }];
      }
    }

    // Role Filters
    if (req.query.role) {
      const roles = req.query.role.split(',');
      queryObj.role = { $in: roles };
    }

    // 2. FETCH DATA (No Pagination!)
    const users = await User.find(queryObj).sort('-createdAt');

    // 3. CREATE EXCEL WORKBOOK
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Define Columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'University', key: 'university', width: 20 },
      { header: 'Year', key: 'yearOfStudy', width: 10 },
      { header: 'Committee', key: 'committee', width: 15 }
    ];

    // Style the Header Row (Bold & Yellow)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE0' } // Light Yellow
    };

    // Add Data Rows
    users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '-',
        university: user.university || '-',
        yearOfStudy: user.yearOfStudy || '-',
        committee: user.committee || '-'
      });
    });

    // 4. SEND RESPONSE (Download)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'users_export.xlsx'
    );

    await workbook.xlsx.write(res);
    res.status(200).end();

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  loginUser,
  logoutUser,
  getUserProfile,
  registerUser,
  createUser,
  getUsers,
  exportUsersToExcel,
  verifyEmailOTP
};