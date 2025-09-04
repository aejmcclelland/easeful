// src/middleware/auth.js
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes using server-side sessions
exports.protect = () => {
	return async (req, res, next) => {
		try {
			const sid = req.cookies && req.cookies.sid; // opaque session id cookie
			if (!sid)
				return next(
					new ErrorResponse('Not authorised to access this route', 401)
				);

			const sessionStore = req.app.get('sessionStore');
			if (!sessionStore || typeof sessionStore.get !== 'function') {
				return next(new ErrorResponse('Session store not configured', 500));
			}

			const session = await sessionStore.get(sid);
			if (!session)
				return next(
					new ErrorResponse('Not authorised to access this route', 401)
				);

			const user = await User.findById(session.userId).select('-password');
			if (!user)
				return next(
					new ErrorResponse('Not authorised to access this route', 401)
				);

			req.user = user; // for your userScope + controllers
			req.session = session; // if you need session info later
			next();
		} catch {
			return next(
				new ErrorResponse('Not authorised to access this route', 401)
			);
		}
	};
};

// Grant access to specific roles (unchanged)
exports.authorise = (...roles) => {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User role ${
						req.user?.role ?? 'unknown'
					} is not authorized to access this route`,
					403
				)
			);
		}
		next();
	};
};
