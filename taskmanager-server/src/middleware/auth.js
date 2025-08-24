const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Prefer: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    // Allow a custom header as a fallback
    token = req.headers['x-auth-token'];
  } else if (req.cookies && req.cookies.token) {
    // Allow the httpOnly cookie set by login
    token = req.cookies.token;
  }

  // Ensure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorised to access this route', 401));
  }

  try {
    // Verify token and attach user to req
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('Not authorised to access this route', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorised to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorise = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User role ${req.user.role} is not authorized to access this route`,
					403
				)
			);
		}
		next();
	};
};
