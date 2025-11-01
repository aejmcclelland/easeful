const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes using server-side sessions (API-safe: always JSON on failure)
exports.protect = () => {
  return async (req, res, next) => {
    const deny = (msg = 'Not authenticated') => {
      return res.status(401).json({ success: false, error: msg });
    };

    try {
      const sid = req.cookies && req.cookies.sid;
      if (!sid) return deny();

      const sessionStore = req.app.get('sessionStore');
      if (!sessionStore || typeof sessionStore.get !== 'function') {
        return res
          .status(500)
          .json({ success: false, error: 'Session store not configured' });
      }

      const session = await sessionStore.get(sid);
      if (!session) return deny('Session expired');

      const user = await User.findById(session.userId).select('-password');
      if (!user) return deny('User not found');

      req.user = user;
      req.session = session;
      return next();
    } catch (err) {
      return deny();
    }
  };
};

// Grant access to specific roles (API-safe: always JSON on failure)
exports.authorise = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      const role =
        req.user && req.user.role ? req.user.role : 'unknown';
      return res.status(403).json({
        success: false,
        error: `User role ${role} is not authorized to access this route`,
      });
    }
    next();
  };
};
