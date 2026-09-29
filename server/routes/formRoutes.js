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
const { WRITE_ROLES } = require('../constants/roles');

// Public Routes
formRouter.get('/', getForms);
formRouter.get('/:id', getForm);

// Everything else here writes. xcom only: board can read the forms list through
// the public routes above, but cannot create, delete, or edit one.
//
// The guard is repeated per route rather than applied once with
// router.use(), which only covers routes registered after it. A route added
// above the guard would be public by accident, and nothing would say so.
formRouter.post('/', protect, authorize(...WRITE_ROLES), createForm);

formRouter.delete('/:id', protect, authorize(...WRITE_ROLES), deleteForm);

formRouter.put('/:id/toggle', protect, authorize(...WRITE_ROLES), toggleFormStatus); // Open/Close

formRouter.put('/:id/settings', protect, authorize(...WRITE_ROLES), updateFormSettings); // Update settings

// Renders the submission email for the builder preview. A literal path rather
// than '/:id/...' so it can never be read as a form id. Nothing is sent, but it
// is xcom-only anyway: it exists to serve the form builder, which is xcom-only.
formRouter.post('/preview-email', protect, authorize(...WRITE_ROLES), previewSubmissionEmail);

module.exports = formRouter;
