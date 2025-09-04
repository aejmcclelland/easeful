const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes using server-side sessions
exports.protect = () => {
	return async (req, res, next) => {
		const home = process.env.APP_HOME_URL || '/';
		const wantsHTML = req.accepts(['html', 'json']) === 'html';

		const deny = (msg = 'Not authorised to access this route') => {
			if (wantsHTML) return res.redirect(302, home);
			return next(new ErrorResponse(msg, 401));
		};

		try {
			const sid = req.cookies && req.cookies.sid;
			if (!sid) return deny();

			const sessionStore = req.app.get('sessionStore');
			if (!sessionStore || typeof sessionStore.get !== 'function') {
				return next(new ErrorResponse('Session store not configured', 500));
			}

			const session = await sessionStore.get(sid);
			if (!session) return deny();

			const user = await User.findById(session.userId).select('-password');
			if (!user) return deny();

			req.user = user;
			req.session = session;
			return next();
		} catch (err) {
			return deny();
		}
	};
};

// Grant access to specific roles (unchanged API)
exports.authorise = (...roles) => {
	return (req, res, next) => {
		if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
			const home = process.env.APP_HOME_URL || '/';
			const wantsHTML = req.accepts(['html', 'json']) === 'html';
			if (wantsHTML) return res.redirect(302, home);
			return next(
				new ErrorResponse(
					`User role ${
						req.user && req.user.role ? req.user.role : 'unknown'
					} is not authorized to access this route`,
					403
				)
			);
		}
		next();
	};
};
