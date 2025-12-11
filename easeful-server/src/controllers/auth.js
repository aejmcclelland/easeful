const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const Task = require('../models/Tasks');
const { cloudinary } = require('../cloudinary');
const { COOKIE_NAME, sessionCookieOptions, DAY } = require('../config/cookies');
const fs = require('fs');
const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = {
	httpOnly: true,
	secure: isProd, // 🔑 false in local dev (http)
	sameSite: isProd ? 'none' : 'lax', // 🔑 'lax' in dev so it works on http://localhost
	path: '/',
	maxAge: 24 * 60 * 60 * 1000, // 1 day
};

async function sendSession(user, req, res, statusCode = 200) {
	const days = Number(process.env.SESSION_COOKIE_EXPIRE || 1);
	const ttlMs = days * DAY;
	const sessionStore = req.app.get('sessionStore');
	if (!sessionStore) {
		return res
			.status(500)
			.json({ success: false, error: 'Session store not configured' });
	}
	const sid = await sessionStore.create(user._id, ttlMs);
	return res
		.status(statusCode)
		.cookie(COOKIE_NAME, sid, cookieOptions)
		.json({ success: true });
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;
	const user = await User.create({ name, email, password, role: 'user' });
	await sendSession(user, req, res, 201);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password)
		return next(new ErrorResponse('Please provide an email and password', 400));

	const user = await User.findOne({ email }).select('+password');
	if (!user || !(await user.matchPassword(password))) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	await sendSession(user, req, res, 200);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
	try {
		const sid = req.cookies?.[COOKIE_NAME];
		const store = req.app.get('sessionStore');
		if (sid && store && typeof store.destroy === 'function') {
			await store.destroy(sid);
		}
	} catch (_) {
		// ignore store errors on logout
	}

	res.clearCookie(COOKIE_NAME, {
		path: '/',
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? 'none' : 'lax',
	});

	return res.status(200).json({ success: true });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
	res.status(200).json({ success: true, data: req.user });
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
	if (!user)
		return next(new ErrorResponse('There is no user with that email', 404));

	const resetToken = user.getResetPasswordToken();
	await user.save({ validateBeforeSave: false });

	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/auth/resetpassword/${resetToken}`;
	const message = `You are receiving this email because you, or someone else, has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password reset token',
			message,
		});
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
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');
	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});
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

	if (!req.files || !req.files.avatar)
		return next(new ErrorResponse('Please upload an image file', 400));
	const file = req.files.avatar;

	if (!file.mimetype.startsWith('image'))
		return next(new ErrorResponse('Please upload an image file', 400));

	const MAX = Number(process.env.FILE_UPLOAD_LIMIT || 8 * 1024 * 1024);
	if (file.size > MAX) {
		return next(
			new ErrorResponse(`Please upload an image less than ${MAX}`, 400)
		);
	}

	if (user.avatar && user.avatar.public_id) {
		try {
			await cloudinary.uploader.destroy(user.avatar.public_id);
		} catch (_) {}
	}

	try {
		const publicId = `avatar_${user._id}_${Date.now()}`;

		// Prefer temp file path when using express-fileupload with useTempFiles: true
		if (file.tempFilePath) {
			let result;
			try {
				result = await cloudinary.uploader.upload(file.tempFilePath, {
					folder: 'TaskManager/avatars',
					public_id: publicId,
				});
			} finally {
				// Best-effort cleanup of temp file
				try {
					fs.unlinkSync(file.tempFilePath);
				} catch (_) {}
			}

			user.avatar = { public_id: result.public_id, url: result.secure_url };
			await user.save();
			return res.status(200).json({ success: true, data: user });
		}

		// Fallback: buffer-based upload via stream
		if (!file.data || !file.data.length) {
			return next(new ErrorResponse('Uploaded file is empty', 400));
		}

		await new Promise((resolve, reject) => {
			const upload = cloudinary.uploader.upload_stream(
				{ folder: 'TaskManager/avatars', public_id: publicId },
				async (error, result) => {
					if (error) return reject(error);
					try {
						user.avatar = {
							public_id: result.public_id,
							url: result.secure_url,
						};
						await user.save();
						res.status(200).json({ success: true, data: user });
						resolve();
					} catch (e) {
						reject(e);
					}
				}
			);
			upload.end(file.data);
		});
	} catch (error) {
		return next(new ErrorResponse('Problem with file upload', 500));
	}
});

// @desc    Delete current logged-in user and their data
// @route   DELETE /api/auth/me
// @access  Private
exports.deleteMe = asyncHandler(async (req, res, next) => {
	const userId = req.user.id;

	const user = await User.findById(userId);
	if (!user) {
		return next(new ErrorResponse('User not found', 404));
	}

	// Optional safety: require explicit confirm from body
	if (!req.body || req.body.confirm !== true) {
		return next(new ErrorResponse('Confirmation required', 400));
	}

	// 1) Delete all tasks and their images for this user
	const tasks = await Task.find({ user: userId }).select('images');

	for (const task of tasks) {
		// If you store images as array [{ public_id, url }, ...]
		if (Array.isArray(task.images)) {
			for (const img of task.images) {
				if (img && img.public_id) {
					try {
						await cloudinary.uploader.destroy(img.public_id);
					} catch (_) {
						// best-effort; don't block the whole deletion
					}
				}
			}
		}
	}

	await Task.deleteMany({ user: userId });

	//  Delete user avatar from Cloudinary if present
	if (user.avatar && user.avatar.public_id) {
		try {
			await cloudinary.uploader.destroy(user.avatar.public_id);
		} catch (_) {}
	}

	//  Delete the user
	await user.deleteOne();

	//  Destroy current session and clear cookie (same idea as logout)
	try {
		const sid = req.cookies?.[COOKIE_NAME];
		const store = req.app.get('sessionStore');
		if (sid && store && typeof store.destroy === 'function') {
			await store.destroy(sid);
		}
	} catch (_) {
		// ignore store errors
	}

	res.clearCookie(COOKIE_NAME, {
		path: '/',
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? 'none' : 'lax',
	});

	// 204 = successfully processed, no content
	return res.status(204).send();
});
