const { catchAsync, AppError } = require('../middleware/errorsMiddleware');
const PendingRequest = require('../models/PendingRequest');
const User = require('../models/UserModel');
const { readSettings } = require('./settingsController');
const { sendCommitteeDecisionEmail } = require('../utils/sendEmail');

const createCommitteeRequest = catchAsync(async (req, res) => {
  const { committee_position } = req.body;
  const userId = req.user._id;

  if (!committee_position) {
    throw new AppError('Committee position is required', 400);
  }

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  // XCom & Board members are accepted immediately
  if (['xcom', 'board'].includes(existingUser.role)) {
    // Admins are placed directly, so this switch is aimed at members and does
    // not apply to them.
    if (existingUser.committee === committee_position) {
      throw new AppError('User already has this committee position', 400);
    }
    existingUser.committee = committee_position;
    await existingUser.save();
    await PendingRequest.deleteMany({ userId, request_status: 'pending' });
    return res.status(201).json({
      success: true,
      message: 'Committee request submitted and accepted automatically',
      data: existingUser
    });
  }

  // An admin can pause new applications. Checked here rather than in the route
  // so the board can still review everything already submitted.
  const settings = await readSettings();
  if (!settings.committeeApplicationsOpen) {
    throw new AppError(
      'Committee applications are currently closed. Please try again later.',
      403
    );
  }

  const existingRequest = await PendingRequest.findOne({ userId, request_status: 'pending' });
  if (existingRequest) {
    throw new AppError('You already have a pending committee request. Please wait for it to be reviewed.', 400);
  }

  const request = await PendingRequest.create({
    userId,
    committee_position,
    request_status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Committee request submitted successfully',
    data: request
  });
});

const updateRequestStatus = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be either approved or rejected', 400);
  }

  const request = await PendingRequest.findById(requestId);
  if (!request) {
    throw new AppError('Request not found', 404);
  }

  if (request.request_status !== 'pending') {
    throw new AppError('Request has already been processed', 400);
  }

  const user = await User.findById(request.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (status === 'approved') {
    user.committee = request.committee_position;
    await user.save();
  }

  // The request is kept as history rather than deleted, so the dashboard can
  // show who decided it and when. The `request_status !== 'pending'` guard
  // above is what stops a request being decided twice.
  request.request_status = status;
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  sendCommitteeDecisionEmail({
    email: user.email,
    userName: user.name,
    committeePosition: request.committee_position,
    accepted: status === 'approved'
  });

  res.json({
    success: true,
    message: `Request ${status} successfully`,
    data: user
  });
});

const getMyRequests = catchAsync(async (req, res) => {
  const requests = await PendingRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: requests,
  });
});

const getAllRequests = catchAsync(async (req, res) => {
  const { status, committee_position, page = 1, limit = 10 } = req.query;
  
  const query = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query.request_status = status;
  }
  if (committee_position) {
    query.committee_position = committee_position;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // A decided request is ordered by when it was decided, so the Approved and
  // Rejected tabs read as a decision log. Anything else falls back to the date
  // the request was made.
  const sort = query.request_status === 'pending'
    ? { createdAt: -1 }
    : query.request_status
      ? { reviewedAt: -1, createdAt: -1 }
      : { createdAt: -1 };

  const [requests, total] = await Promise.all([
    PendingRequest.find(query)
      .populate('userId', 'name email committee position yearOfStudy university college organization roleInOrganization yearsOfExperience')
      .populate('reviewedBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    PendingRequest.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: requests,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum
    }
  });
});

const changeCommitteePosition = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { committee_position } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if(user.committee === committee_position) {
    throw new AppError('User already has this committee position', 400);
  }

  user.committee = committee_position;
  await user.save();

  res.json({
    success: true,
    message: 'Committee position changed successfully',
    data: user
  });
});

module.exports = {
  createCommitteeRequest,
  updateRequestStatus,
  getMyRequests,
  getAllRequests,
  changeCommitteePosition
};