const express = require('express');
const seasonRouter = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { WRITE_ROLES } = require('../constants/roles');

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

// Writes are xcom only; board reads seasons through the public routes above.
// The guard is repeated per route rather than applied with router.use(), which
// only covers routes registered after it.
seasonRouter.post('/', protect, authorize(...WRITE_ROLES), createSeason);

seasonRouter.put('/:id', protect, authorize(...WRITE_ROLES), updateSeason);
seasonRouter.put('/:id/home', protect, authorize(...WRITE_ROLES), setHomeSeason);
seasonRouter.delete('/:id', protect, authorize(...WRITE_ROLES), deleteSeason);

module.exports = seasonRouter;
