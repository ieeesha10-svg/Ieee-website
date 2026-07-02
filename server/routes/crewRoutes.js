const express = require('express');
const crewRouter = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createCrew,
  getAllCrew,
  updateCrew,
  deleteCrew,
} = require('../controllers/crewController');

crewRouter.get('/', getAllCrew);

crewRouter.use(protect, authorize('xcom', 'board')); // Only xcom and board can create, update, or delete crew

crewRouter.post('/', createCrew);

crewRouter.put('/:id', updateCrew);

crewRouter.delete('/:id', deleteCrew);

module.exports = crewRouter;