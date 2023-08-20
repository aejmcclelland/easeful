const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const multer = require('multer');
const Tasks = require('../models/tasks');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage: storage });

//@desc     Get all tasks
//@route    GET /api/taskman
//@access   Public
exports.getTasks = asyncHandler(async (req, res, next) => {
	let query;

	// copy req.query
	const reqQuery = { ...req.query };

	// fields to exclude
	const removeFields = ['select', 'sort', 'page', 'limit'];

	// loop over removeFelds and delete from reqQuery
	removeFields.forEach(param => delete reqQuery[param]);

	// create query string form query params
	let queryStr = JSON.stringify(reqQuery);

	// replace takes in regex of any operator ($gt, $gte, etc)
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

	// set query to queryStr to find resource
	query = Tasks.find(JSON.parse(queryStr));

	// select fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
	}
	// sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort({ createdAt: 'asc', name: -1 });
	}

	//Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Tasks.countDocuments(JSON.parse(queryStr));

	query = query.skip(startIndex).limit(limit);

	// Execute query
	const tasks = await query;

	//Pagination result
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res
		.status(200)
		.json({ success: true, count: tasks.length, pagination, data: tasks });
	console.log(req.body);
});

//@desc     Get one task
//@route    GET /api/taskman/:id
//@access   Public
exports.getTask = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({ success: true, data: task });
});
//@desc     Create new task
//@route    POST /api/taskman
//@access   Private
exports.createTask = asyncHandler(async (req, res, next) => {
	const images = []; //store upload image URLs and filenames

	// Images have already been uploaded and processed by multer and multer-storage-cloudinary
	if (req.files) {
		for (const file of req.files) {
			images.push({
				url: file.secure_url,
				filename: file.originalname,
			});
		}
	}

	const task = await Tasks.create({ ...req.body, images: images });
	res.status(201).json({ success: true, data: task });
});
//@desc     Update task
//@route    PUT /api/taskman/:id
//@access   Private
exports.updateTask = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({ success: true, data: task });
});
//@desc     Delete task
//@route    DELETE /api/taskman/:id
//@access   Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findByIdAndDelete(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({ success: true, data: {} });
});

//@desc     Update task
//@route    PUT /api/taskman/:id/photo
//@access   Private
exports.taskPhotoUpload = asyncHandler(async (req, res, next) => {
	upload.array('image')(req, res, async function (err) {
		if (err) {
			return next(new ErrorResponse('Error during image upload', 500));
		}

		try {
			const task = await Tasks.findById(req.params.id);
			console.log('Task:', task);
			console.log(req.body, req.file);
			res.send('Image uploaded successfully!');
		} catch (err) {
			console.error('Error during image upload:', err);
			return next(new ErrorResponse('Error during image upload', 500));
		}
	});
});
