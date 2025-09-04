const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const { cloudinary } = require('../cloudinary');
const { COOKIE_NAME, sessionCookieOptions, DAY} = require('../config/cookies');


async function sendSession(user, req, res, statusCode = 200) {
  const days = Number(process.env.SESSION_COOKIE_EXPIRE || 1);
  const ttlMs = days * DAY;
  const sessionStore = req.app.get('sessionStore');
  if (!sessionStore) {
    return res.status(500).json({ success: false, error: 'Session store not configured' });
  }
  const sid = await sessionStore.create(user._id, ttlMs);
  return res
		.status(statusCode)
		.cookie(COOKIE_NAME, sid, sessionCookieOptions(days))
		.json({ success: true });
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: 'user' });
  await sendSession(user, req, res, 200);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorResponse('Please provide an email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  await sendSession(user, req, res, 200);
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  const sid = req.cookies?.sid;
  if (sid) {
    const store = req.app.get('sessionStore');
    if (store) await store.destroy(sid);
  }
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user; // set by session protect middleware
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = { name: req.body.name, email: req.body.email };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

// @desc    Update password (rotate session)
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  // Invalidate old session & issue a new one
  const oldSid = req.cookies?.sid;
  const store = req.app.get('sessionStore');
  if (oldSid && store) await store.destroy(oldSid);
  await sendSession(user, req, res, 200);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse('There is no user with that email', 404));

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you, or someone else, has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({ email: user.email, subject: 'Password reset token', message });
    return res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password (rotate session)
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) return next(new ErrorResponse('Invalid token', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await sendSession(user, req, res, 200);
});

// @desc    Update avatar
// @route   PUT /api/auth/updateavatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse('User not found', 404));

  if (!req.files || !req.files.avatar) return next(new ErrorResponse('Please upload an image file', 400));
  const file = req.files.avatar;

  if (!file.mimetype.startsWith('image')) return next(new ErrorResponse('Please upload an image file', 400));

  const MAX = Number(process.env.FILE_UPLOAD_LIMIT || 1048576);
  if (file.size > MAX) {
    return next(new ErrorResponse(`Please upload an image less than ${MAX}`, 400));
  }

  if (user.avatar && user.avatar.public_id) {
    try { await cloudinary.uploader.destroy(user.avatar.public_id); } catch (_) {}
  }

  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'TaskManager/avatars', public_id: `avatar_${user._id}_${Date.now()}` },
      async (error, result) => {
        if (error) return next(new ErrorResponse('Problem with file upload', 500));
        user.avatar = { public_id: result.public_id, url: result.secure_url };
        await user.save();
        res.status(200).json({ success: true, data: user });
      }
    );
    stream.end(file.data);
  } catch (error) {
    return next(new ErrorResponse('Problem with file upload', 500));
  }
});
