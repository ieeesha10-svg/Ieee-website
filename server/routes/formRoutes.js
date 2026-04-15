const express = require('express');
const router = express.Router();
const { 
  createForm, 
  getForm, 
  getForms, 
  deleteForm, 
  toggleFormStatus 
} = require('../controllers/formController');

// Import Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Route (Students viewing the form)
router.get('/:id', getForm);

// Protected Admin Routes
// Note: We use .route() to chain methods on the same URL
router.route('/')
  .post(protect, authorize('xcom','board'), createForm) // Create
  .get(protect,authorize('xcom','board'), getForms);   // List all

router.route('/:id')
  .delete(protect, authorize('xcom','board'), deleteForm); // Delete

router.put('/:id/toggle', protect, authorize('xcom','board'), toggleFormStatus); // Open/Close

module.exports = router;