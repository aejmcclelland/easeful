const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');
const User = require('../models/User');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		//Set token from Bearer token in header
		token = req.headers.authorization.split(' ')[1];
		//Set token form cookie
	}
	//else if (req.cookies.token){
	//token = req.cookies.token;
	//}

	//Make sure toekn exists
	if (!token) {
		return next(new ErrorResponse('Not authorised to access this route', 401));
	}

	try {
		//Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.user = User.findById(decoded.id);

		next();
	} catch (err) {
		return next(new ErrorResponse('Not authorised to access this route', 401));
	}
});
