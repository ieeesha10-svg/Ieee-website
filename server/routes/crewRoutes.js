const express = require('express');
const crewRouter = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { WRITE_ROLES } = require('../constants/roles');

const {
  createCrew,
  getAllCrew,
  updateCrew,
  deleteCrew,
} = require('../controllers/crewController');

crewRouter.get('/', getAllCrew);

// Writes are xcom only; board reads crew through the public route above. The
// guard is repeated per route rather than applied with router.use(), which would
// only cover routes registered after it.
crewRouter.post('/', protect, authorize(...WRITE_ROLES), createCrew);

crewRouter.put('/:id', protect, authorize(...WRITE_ROLES), updateCrew);

crewRouter.delete('/:id', protect, authorize(...WRITE_ROLES), deleteCrew);

module.exports = crewRouter;