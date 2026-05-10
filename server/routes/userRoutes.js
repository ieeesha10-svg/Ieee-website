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
  verifyEmailOTP
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

module.exports = userRouter;