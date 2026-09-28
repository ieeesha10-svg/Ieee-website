const express = require('express');
const formRouter = express.Router();
const { 
  createForm, 
  getForm, 
  getForms, 
  deleteForm, 
  toggleFormStatus,
  updateFormSettings,
  previewSubmissionEmail
} = require('../controllers/formController');

// Import Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Public Routes
formRouter.get('/', getForms);
formRouter.get('/:id', getForm);

// Protected Admin Routes
formRouter.use(protect, authorize('xcom','board')); // <-- All routes below this line require authentication and authorization
// Note: We use .route() to chain methods on the same URL
formRouter.route('/')
  .post(createForm)   // Create

formRouter.route('/:id').delete(deleteForm); // Delete

formRouter.put('/:id/toggle', toggleFormStatus); // Open/Close

formRouter.put('/:id/settings', updateFormSettings); // Update settings

// Renders the submission email for the builder preview. A literal path rather
// than '/:id/...' so it can never be read as a form id. Nothing is sent.
formRouter.post('/preview-email', previewSubmissionEmail);

module.exports = formRouter;
