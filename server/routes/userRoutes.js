const express = require('express');
const userRouter = express.Router();
const { 
  loginUser, 
  logoutUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  getUsers,
  createUser, // <--- Import the new function
  exportUsersToExcel,
  verifyEmailOTP,
  getAllMembers,
  createMember,
  getMember,
  upgradeMemberRole,
  deleteMember
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes
userRouter.post('/register', registerUser); // Anyone can sign up as User/Member
userRouter.post('/verify-email', verifyEmailOTP);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logoutUser);

// Protected Routes
userRouter.get('/profile', protect, getUserProfile);

// Edit Profile
userRouter.put('/profile/:id', protect, updateUserProfile);

// Admin / XCom Routes
userRouter.get('/all', protect, authorize('xcom', 'board'), getUsers); 

// --- THE NEW SECURE ROUTE ---
// Only 'xcom' can create other admins/board members
userRouter.post('/create-internal', protect, authorize('xcom'), createUser);

// EXPORT ROUTE
// Usage: /api/users/export?role=member (Downloads file directly)
userRouter.get('/export', protect, authorize('xcom', 'board'), exportUsersToExcel);   

// admins - members CRUD opertaions for member, board, xcom, scanner
userRouter.get('/members',protect,authorize('xcom', 'board','member','scanner'),getAllMembers);
userRouter.post('/members',protect,authorize('xcom', 'board','member','scanner'),createMember);
userRouter.get('/members/:id',protect,authorize('xcom', 'board','member','scanner'),getMember);
userRouter.patch('/members/:id',protect,authorize('xcom', 'board','member','scanner'),upgradeMemberRole);
userRouter.delete('/members/:id',protect,authorize('xcom', 'board','member','scanner'),deleteMember);
module.exports = userRouter;