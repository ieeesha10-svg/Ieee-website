const express = require('express');
const seasonRouter = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  getSeasons,
  getSeasonById,
  getHomeSeason,
  createSeason,
  updateSeason,
  setHomeSeason,
  deleteSeason,
} = require('../controllers/seasonController');

// Public. The crew pages and the home page all need to read seasons, and a
// visitor has to be able to browse last season's committee without an account.
seasonRouter.get('/', getSeasons);
// Declared before `/:id` on purpose: Express matches in order, so a later
// `/:id` would otherwise swallow the literal "home" and try to cast it.
seasonRouter.get('/home', getHomeSeason);
seasonRouter.get('/:id', getSeasonById);

seasonRouter.use(protect, authorize('xcom', 'board')); // Only xcom and board can manage seasons

seasonRouter.post('/', createSeason);

seasonRouter.put('/:id', updateSeason);
seasonRouter.put('/:id/home', setHomeSeason);
seasonRouter.delete('/:id', deleteSeason);

module.exports = seasonRouter;
