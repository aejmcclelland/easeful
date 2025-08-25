const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const { cloudinary } = require('../cloudinary');

//@desc     register user
//@route    POST /api/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password } = req.body;

	//Create user (role defaults to 'user' from schema)
	const user = await User.create({
		name,
		email,
		password,
	});

	sendTokenResponse(user, 200, res);
});

//@desc     login user
//@route    POST /api/auth/login
//@access   Private
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Validate email and password
	if (!email || !password) {
		return next(new ErrorResponse('Please provide an email and password', 400));
	}
	//Check for user
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	//Check if password matches
	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}
	sendTokenResponse(user, 200, res);
});

//@desc     logout user
//@route    GET /api/auth/logout
//@access   Private
exports.logout = asyncHandler(async (req, res, next) => {
	res.clearCookie('token', {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
	});

	res.status(200).json({ success: true, data: {} });
});

//@desc     Get current logged in user
//@route    GET /api/auth/me
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = req.user; //find user by id from the req in auth.js middleware
	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc     Update user details
//@route    PUT/api/auth/updatedetails
//@access   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc    Update Password
//@route    PUT /api/api/auth/updatepassword
//@access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	//Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}
	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});

//@desc     Forgot password
//@route    POST /api/auth/forgotpassword
//@access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404));
	}

	//Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	//Create reset url
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
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse('Email could not be sent', 500));
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc     Reset password
//@route    PUT /api/auth/resetpassword/:resettoken
//@access   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	//Get hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse('Invalid token', 400));
	}

	//Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	sendTokenResponse(user, 200, res);
});

//@desc     Update avatar
//@route    PUT /api/auth/updateavatar
//@access   Private
exports.updateAvatar = asyncHandler(async (req, res, next) => {
	console.log('updateAvatar called');
	console.log('req.files:', req.files);
	console.log('req.body:', req.body);

	const user = await User.findById(req.user.id);

	if (!user) {
		return next(new ErrorResponse('User not found', 404));
	}

	// Check if file was uploaded using express-fileupload
	if (!req.files || !req.files.avatar) {
		return next(new ErrorResponse('Please upload an image file', 400));
	}

	const file = req.files.avatar;

	// Make sure the image is a photo
	if (!file.mimetype.startsWith('image')) {
		return next(new ErrorResponse('Please upload an image file', 400));
	}

	// Check filesize
	if (file.size > process.env.FILE_UPLOAD_LIMIT) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${process.env.FILE_UPLOAD_LIMIT}`,
				400
			)
		);
	}

	// Delete old avatar from cloudinary if it exists
	if (user.avatar && user.avatar.public_id) {
		try {
			await cloudinary.uploader.destroy(user.avatar.public_id);
		} catch (error) {
			console.log('Error deleting old avatar:', error);
		}
	}

	try {
		// Upload new avatar to cloudinary
		const result = await cloudinary.uploader.upload_stream(
			{
				folder: 'TaskManager/avatars',
				public_id: `avatar_${user._id}_${Date.now()}`,
			},
			async (error, result) => {
				if (error) {
					console.error('Error uploading to cloudinary:', error);
					return next(new ErrorResponse('Problem with file upload', 500));
				}

				// Update user with new avatar
				user.avatar = {
					public_id: result.public_id,
					url: result.secure_url,
				};

				await user.save();

				res.status(200).json({
					success: true,
					data: user,
				});
			}
		);

		// Pipe the file buffer to cloudinary
		result.end(file.data);
	} catch (error) {
		console.error('Error uploading avatar:', error);
		return next(new ErrorResponse('Problem with file upload', 500));
	}
});

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	//Create token
	const token = user.getSignedJwtToken();

	const options = {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		// Remove domain restriction to allow cross-origin cookies
		// domain: undefined,
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
	};
	res
		.status(statusCode)
		.cookie('token', token, options)
		.json({ success: true, token });
};
