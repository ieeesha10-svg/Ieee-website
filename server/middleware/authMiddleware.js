const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const protect = async (req, res, next) => {
  let token;

  // Read from the Cookie named 'jwt'
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Like `protect`, but lets guests through — sets `req.user` only when a valid JWT cookie is present.
const optionalProtect = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = undefined;
    }
  }

  next();
};

// For routes that address one specific user's own record — a "me" style lookup
// where the id is in the path instead of implied by the session.
//
// Without this, `GET /submissions/:userid/:formid` was readable by any signed-in
// account: the only check was that *a* valid session existed, not that the
// session belonged to `:userid`. A plain member with no dashboard could read
// every other member's form answers just by changing the id.
//
// The rule: your own record is always yours, and anyone who is allowed to read
// submissions in bulk (board, xcom) may read anyone's. Everyone else is 403'd
// with a message that does not confirm whether the record exists.
const authorizeSelfOr = (...roles) => {
  return (req, res, next) => {
    const targetId = req.params.userid ?? req.params.id;
    const isSelf = String(targetId) === String(req.user._id);
    const hasRole = roles.includes(req.user.role);

    if (!isSelf && !hasRole) {
      return res.status(403).json({
        message: 'Not authorized to view this record',
      });
    }
    next();
  };
};


module.exports = { protect, authorize, optionalProtect, authorizeSelfOr };