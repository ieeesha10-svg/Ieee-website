const express = require('express');
const formRouter = express.Router();
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
formRouter.get('/:id', getForm);

// Protected Admin Routes
formRouter.use(protect, authorize('xcom','board')); // <-- All routes below this line require authentication and authorization
// Note: We use .route() to chain methods on the same URL
formRouter.route('/')
  .post(createForm) // Create
  .get(getForms);   // List all

formRouter.route('/:id').delete(deleteForm); // Delete

formRouter.put('/:id/toggle', toggleFormStatus); // Open/Close

module.exports = formRouter;