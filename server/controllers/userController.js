const User = require('../models/UserModel');
const Submission = require('../models/SubmissionModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const {sendOTPEmail, resetPasswordEmailToken} = require('../utils/sendEmail.js');
const { catchAsync, AppError } = require('../middleware/errorsMiddleware.js');
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
const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Account not verified. Please check your email for the OTP.', 403);
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
});

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
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      committee: user.committee,
      phone: user.phone,
      age: user.age,
      university: user.university,
      college: user.college,
      yearOfStudy: user.yearOfStudy,
      interests: user.interests,
      optionalData: user.optionalData
    }
  });
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
      name, email, password, confirmPassword,
      phone, age, university, college, yearOfStudy, interests, role
    } = req.body;

    if(password !== confirmPassword){
      throw new AppError('Passwords do not match', 400);
    }

    const userExists = await User.findOne({email : email.toLowerCase()});
    if (userExists) {
      throw new AppError('User already exists', 400);
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
      phone, age, university, college, yearOfStudy, interests
    });

    const emailSent = await sendOTPEmail(user.email, otp);

    if (!emailSent) {
      throw new AppError("User registered, but failed to send OTP email.", 500);
    }

    res.status(201).json({ 
      message: "Registration successful. Please check your email for the OTP.",
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/users/verify-email
// @access  Public
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

//admins-members CRUD operations
// @desc    Update User Profile (Self-Service)
// @route   PUT /api/users/:id
// @access  Private (User can only update their own profile)
const updateUserProfile = catchAsync(async (req, res) => {
  if(req.user.id != req.params.id){
    throw new AppError('HACKER : You can only update your own profile', 403);
  }
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }
  // Check if any restricted fields are being updated
  // We use a flag instead of throwing immediately to check all fields and provide a comprehensive error message if needed
  const hasRestrictedField = false;
  restrictedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      hasRestrictedField = true;
    } 
  });

  if (hasRestrictedField) {
    throw new AppError("You are not allowed to update restricted fields", 403);
  }
  // Only allow updates to specific fields
  const allowedUpdates = [
    "name",
    "phone",
    "age",
    "university",
    "college",
    "yearOfStudy",
    "interests",
    "committee",
    "optionalData",
  ];
  
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const restrictedFields = [
    "email",
    "password",
    "role",
    "isVerified",
    "otp",
    "otpExpires",
    "resetPasswordToken",
    "resetPasswordExpires",
  ];

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      age: updatedUser.age,
      university: updatedUser.university,
      college: updatedUser.college,
      yearOfStudy: updatedUser.yearOfStudy,
      interests: updatedUser.interests,
      committee: updatedUser.committee,
      optionalData: updatedUser.optionalData,
    },
  });
})

const updatePassword = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
  
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new AppError('Please provide current password, new password, and confirm new password', 400);
  }

  if (newPassword !== confirmNewPassword) {
    throw new AppError('New password and confirm new password do not match', 400);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
})

const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const token = jwt.sign({ id: user._id, secret: resetOTP }, process.env.JWT_SECRET, { expiresIn: '1h' });
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  const emailsent = await resetPasswordEmailToken(email, token);
  if (!emailsent) {
    throw new AppError('Failed to send reset password email', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Reset password email sent successfully',
  });
})

const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword, confirmNewPassword } = req.body;
  const { token } = req.query;
  
  if (!token || !email || !newPassword || !confirmNewPassword) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (newPassword !== confirmNewPassword) {
    throw new AppError('New password and confirm new password do not match', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (token !== user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

// get all members for member, board, xcom, scanner
const getAllMembers=catchAsync(async(req,res,next)=>{
  const allUsers=await User.find();
  if(!allUsers||allUsers.length===0){
    return next(new AppError("No users to show",400));
  }
  res.status(200).json({
    dataLength:allUsers.length,
    data:allUsers
  });
});

//create member
const createMember=catchAsync(async(req,res,next)=>{
    const allowedRoles=User.schema.path("role").enumValues;
  const {name,email,password,role,phone,age,university,college,yearOfStudy,interests,committee,optionalData}=req.body;
  if(!name || !email || !password || !password || !role){
    return next(new AppError("Please Provide name, email, role and password",400));
  }
  if(!allowedRoles.includes(role)){
      return next(new AppError(`Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,400 ));}
  const exists=await User.findOne({email:email});
  if(exists){
    return next(new AppError('Member already exists',400));
  }
  const newMember=await User.create({
    name:name,
    email:email,
    password:password,
    role:role,
    phone:phone,
    age:age,
    university:university,
    college:college,
    yearOfStudy:yearOfStudy,
    interests,
    committee:committee,
    optionalData:optionalData
  });
  res.status(201).json({
    status:'success',
      message:'Member created successfly',
      data:newMember
  });
});

//get member
const getMember=catchAsync(async(req,res,next)=>{
  const member=await User.findById(req.params.id);
  if(!member){
    return next(new AppError("Member not found",400));
  }
  res.status(200).json({
    status:'success',
    data:member
  });
});
// upgrade member role 
const upgradeMemberRole=catchAsync(async(req,res,next)=>{
  const {role}=req.body;
  const allowedRoles=User.schema.path("role").enumValues;
  if(!role){
     return next(new AppError("Role is required",400));
  }
  if(!allowedRoles.includes(role)){
    return next(new AppError(`Invalid role. Allowed roles are: ${allowedRoles.join(", ")}`,400 ));}
  const updatedMember=await User.findByIdAndUpdate(req.params.id,{role},{new:true});
  if(!updatedMember){
    return next(new AppError("Member not found",400));
  }
  res.status(200).json({
    status:'success',
    message:'Member role updated successfly',
    data:updatedMember
  });
});

//delete member 
const deleteMember=catchAsync(async(req,res,next)=>{
  const member=await User.findByIdAndDelete(req.params.id);
  if(!member){
    return next(new AppError("Member not found",400));
  }
  res.status(204).json({
    status:'success',
    message:'Member deleted successfly'
  });
});
module.exports = {
  loginUser,
  logoutUser,
  getUserProfile,
  registerUser,
  createUser,
  getUsers,
  exportUsersToExcel,
  verifyEmailOTP,
  getAllMembers,
  createMember,
  getMember,
  upgradeMemberRole,
  deleteMember,
  updateUserProfile
};