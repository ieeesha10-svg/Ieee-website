const express = require('express');
const router = express.Router();
const {
  createCommitteeRequest,
  updateRequestStatus,
  getMyRequests,
  getAllRequests,
  changeCommitteePosition
} = require('../controllers/committeeRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { VIEW_ROLES, WRITE_ROLES } = require('../constants/roles');

router.post('/', protect, createCommitteeRequest);
router.get('/my', protect, getMyRequests);

router.get('/', protect, authorize(...VIEW_ROLES), getAllRequests);
// Approving a request writes `user.committee` and sends a decision email, so
// board cannot do it despite being able to read the queue.
router.put('/:requestId/status', protect, authorize(...WRITE_ROLES), updateRequestStatus);
router.put('/:userId/position', protect, authorize(...WRITE_ROLES), changeCommitteePosition);

module.exports = router;