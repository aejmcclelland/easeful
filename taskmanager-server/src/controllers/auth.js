const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

//@desc     register user
//@route    POST /api/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	//Create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	sendTokenResposne(user, 200, res);
});

//@desc     login user
//@route    POST /api/auth/login
//@access   Public
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
	sendTokenResposne(user, 200, res);
});

//Get token from model, create cookie and send response
const sendTokenResposne = (user, statusCode, res) => {
	//Create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res
		.status(statusCode)
		.cookie('token', token, options)
		.json({ success: true, token });
};
