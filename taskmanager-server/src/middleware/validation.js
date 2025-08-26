const { body, validationResult, query } = require('express-validator');

// Generic validation result handler
const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			error: 'Validation failed',
			details: errors.array().map(err => ({
				field: err.path,
				message: err.msg,
				value: err.value
			}))
		});
	}
	next();
};

// Task validation rules
const taskValidation = [
	body('task')
		.trim()
		.notEmpty()
		.withMessage('Task name is required')
		.isLength({ min: 1, max: 150 })
		.withMessage('Task name must be between 1 and 150 characters')
		.escape(), // XSS protection
	
	body('description')
		.trim()
		.notEmpty()
		.withMessage('Description is required')
		.isLength({ min: 1, max: 2000 })
		.withMessage('Description must be between 1 and 2000 characters')
		.escape(), // XSS protection
	
	body('priority')
		.optional()
		.isIn(['Low', 'Medium', 'High'])
		.withMessage('Priority must be Low, Medium, or High'),
	
	body('status')
		.optional()
		.isIn(['Pending', 'In Progress', 'Completed'])
		.withMessage('Status must be Pending, In Progress, or Completed'),
	
	body('dueDate')
		.optional()
		.custom((value) => {
			if (value === '' || value === null || value === undefined) return true;
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				throw new Error('Invalid date format');
			}
			return true;
		}),
	
	body('labels')
		.optional()
		.isArray({ max: 10 })
		.withMessage('Labels must be an array with maximum 10 items')
		.custom((labels) => {
			if (!Array.isArray(labels)) return true;
			
			for (const label of labels) {
				if (typeof label !== 'string') {
					throw new Error('Each label must be a string');
				}
				if (label.trim().length === 0) {
					throw new Error('Labels cannot be empty');
				}
				if (label.length > 50) {
					throw new Error('Each label must be 50 characters or less');
				}
				if (!/^[a-zA-Z0-9\s\-_]+$/.test(label)) {
					throw new Error('Labels can only contain letters, numbers, spaces, hyphens, and underscores');
				}
			}
			return true;
		})
		.customSanitizer((labels) => {
			if (!Array.isArray(labels)) return labels;
			return labels.map(label => label.trim()).filter(label => label.length > 0);
		}),
	
	// Reject any unexpected fields for security
	body().custom((value, { req }) => {
		const allowedFields = ['task', 'description', 'priority', 'status', 'dueDate', 'labels'];
		const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
		if (extraFields.length > 0) {
			throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
		}
		return true;
	}),
	
	handleValidationErrors
];

// User registration validation
const registerValidation = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Name is required')
		.isLength({ min: 1, max: 100 })
		.withMessage('Name must be between 1 and 100 characters')
		.matches(/^[a-zA-Z\s\-'\.]+$/)
		.withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
		.escape(),
	
	body('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Please enter a valid email address')
		.normalizeEmail()
		.isLength({ max: 255 })
		.withMessage('Email cannot be longer than 255 characters'),
	
	body('password')
		.isLength({ min: 6, max: 128 })
		.withMessage('Password must be between 6 and 128 characters')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
	
	// Reject any unexpected fields for security
	body().custom((value, { req }) => {
		const allowedFields = ['name', 'email', 'password'];
		const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
		if (extraFields.length > 0) {
			throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
		}
		return true;
	}),
	
	handleValidationErrors
];

// Login validation
const loginValidation = [
	body('email')
		.trim()
		.notEmpty()
		.withMessage('Email is required')
		.isEmail()
		.withMessage('Please enter a valid email address')
		.normalizeEmail(),
	
	body('password')
		.notEmpty()
		.withMessage('Password is required'),
	
	// Reject any unexpected fields for security
	body().custom((value, { req }) => {
		const allowedFields = ['email', 'password'];
		const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
		if (extraFields.length > 0) {
			throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
		}
		return true;
	}),
	
	handleValidationErrors
];

// Profile update validation
const updateProfileValidation = [
	body('name')
		.optional()
		.trim()
		.isLength({ min: 1, max: 100 })
		.withMessage('Name must be between 1 and 100 characters')
		.matches(/^[a-zA-Z\s\-'\.]+$/)
		.withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
		.escape(),
	
	body('email')
		.optional()
		.trim()
		.isEmail()
		.withMessage('Please enter a valid email address')
		.normalizeEmail()
		.isLength({ max: 255 })
		.withMessage('Email cannot be longer than 255 characters'),
	
	// Reject any unexpected fields for security
	body().custom((value, { req }) => {
		const allowedFields = ['name', 'email'];
		const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
		if (extraFields.length > 0) {
			throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
		}
		return true;
	}),
	
	handleValidationErrors
];

// Query parameter validation for tasks
const taskQueryValidation = [
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	
	query('sort')
		.optional()
		.isIn(['-createdAt', 'createdAt', 'dueDate', '-priority', '-status'])
		.withMessage('Invalid sort parameter'),
	
	query('q')
		.optional()
		.trim()
		.isLength({ max: 200 })
		.withMessage('Search query cannot be longer than 200 characters')
		.escape(),
	
	handleValidationErrors
];

module.exports = {
	taskValidation,
	registerValidation,
	loginValidation,
	updateProfileValidation,
	taskQueryValidation,
	handleValidationErrors
};