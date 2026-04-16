const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  logoutUser, 
  registerUser, 
  getUserProfile, 
  getUsers,
  createUser, // <--- Import the new function
  exportUsersToExcel,
  verifyEmailOTP
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes
router.post('/', registerUser); // Anyone can sign up as User/Member
router.post('/verify-email', verifyEmailOTP);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected Routes
router.get('/profile', protect, getUserProfile);

// Admin / XCom Routes
router.get('/', protect, authorize('xcom', 'board'), getUsers); 

// --- THE NEW SECURE ROUTE ---
// Only 'xcom' can create other admins/board members
router.post('/create-internal', protect, authorize('xcom'), createUser);

// EXPORT ROUTE
// Usage: /api/users/export?role=member (Downloads file directly)
router.get('/export', protect, authorize('xcom', 'board'), exportUsersToExcel);   

module.exports = router;