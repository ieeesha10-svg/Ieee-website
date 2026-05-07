const express = require('express');
const crewRouter = express.Router();

const {
  createCrew,
  getAllCrew,
  updateCrew,
  deleteCrew,
} = require('../controllers/crewController');

crewRouter.post('/', createCrew);

crewRouter.get('/', getAllCrew);

crewRouter.put('/:id', updateCrew);

crewRouter.delete('/:id', deleteCrew);

module.exports = crewRouter;