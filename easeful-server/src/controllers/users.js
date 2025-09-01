const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

//Helper function to send token response (copied from auth controller)
const sendTokenResponse = (user, statusCode, res) => {
	//Create token
	const token = user.getSignedJwtToken();

	const options = {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
	};
	res
		.status(statusCode)
		.cookie('token', token, options)
		.json({ success: true, token });
};

//@desc     Register user
//@route    POST /api/users/register
//@access   Public
exports.registerUser = asyncHandler(async (req, res, next) => {
	const { name, email, password } = req.body;

	//Create user with explicit role
	const user = await User.create({
		name,
		email,
		password,
		role: 'user', // Explicitly set role to user
	});

	sendTokenResponse(user, 200, res);
});

//@desc     Get all users
//@route    GET /api/auth/users
//@access   Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//@desc     Get single user
//@route    GET /api/auth/users/:id
//@access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc     Create user
//@route    POST /api/auth/users
//@access   Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;

	//Create user
	const user = await User.create({
		name,
		email,
		password,
		role,
	});

	res.status(201).json({
		success: true,
		data: user,
	});
});

//@desc     Update user
//@route    PUT /api/auth/users/:id
//@access   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

//@desc     Delete user
//@route    DELETE /api/auth/users/:id
//@access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});
