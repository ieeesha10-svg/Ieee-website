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

router.post('/', protect, createCommitteeRequest);
router.get('/my', protect, getMyRequests);

router.use(protect, authorize('xcom', 'board'));
router.get('/', getAllRequests);
router.put('/:requestId/status', updateRequestStatus);
router.put('/:userId/position', changeCommitteePosition);

module.exports = router;