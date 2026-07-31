const express = require('express');
const router = express.Router();
const {
  createCommitteeRequest,
  updateRequestStatus,
  getAllRequests,
  changeCommitteePosition
} = require('../controllers/committeeRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createCommitteeRequest);

router.use(protect, authorize('xcom', 'board'));
router.get('/', getAllRequests);
router.put('/:requestId/status', updateRequestStatus);
router.put('/:userId/position', changeCommitteePosition);

module.exports = router;