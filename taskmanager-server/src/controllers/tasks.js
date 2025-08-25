const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const slugify = require('slugify');
const multer = require('multer');
const Tasks = require('../models/Tasks');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage: storage });

//@desc     Get all tasks
//@route    GET /api/taskman
//@access   Private
exports.getTasks = asyncHandler(async (req, res, next) => {
	console.log('getTasks called by user:', req.user.id, 'role:', req.user.role);

	// Add user scope to query - this will be picked up by advancedResults middleware
	// DEFAULT: ALL users can only see their own tasks - NO EXCEPTIONS
	req.query.user = req.user.id;

	console.log('Query params after user filter applied:', req.query);
	console.log('User can only see tasks where user field equals:', req.user.id);

	// advancedResults middleware handles the actual query, pagination, filtering, sorting
	res.status(200).json(res.advancedResults);
});

//@desc     Get one task
//@route    GET /api/taskman/:id
//@access   Private
exports.getTask = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure user is task owner (unless they're admin)
	if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to view this task`,
				403
			)
		);
	}

	res.status(200).json({ success: true, data: task });
});
//@desc     Create new task
//@route    POST /api/taskman
//@access   Private
exports.createTask = asyncHandler(async (req, res, next) => {
	try {
		//Add user to req.body
		req.body.user = req.user.id;

		const images = []; //store upload image URLs and filenames

		// Images have already been uploaded and processed by multer and multer-storage-cloudinary
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				images.push({
					url: file.secure_url,
					filename: file.originalname,
				});
			}
		}

		// Create the task - users can create multiple tasks
		const task = await Tasks.create({ ...req.body, images: images });
		res.status(201).json({ success: true, data: task });
	} catch (error) {
		console.error('Error creating task:', error);
		if (error.code === 11000) {
			// Duplicate key error (though we removed unique constraint)
			return next(new ErrorResponse('Task with this name already exists', 400));
		}
		return next(new ErrorResponse('Failed to create task', 500));
	}
});

//@desc     Update task
//@route    PUT /api/taskman/:id
//@access   Private
exports.updateTask = asyncHandler(async (req, res, next) => {
	let task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}
	//Make sure user is Task owner
	if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorised to update this task`,
				401
			)
		);
	}

	//update slug when updating name
	if (Object.keys(req.body).includes('name')) {
		req.body.slug = slugify(req.body.name, { lower: true });
	}

	task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: task });
});

//@desc     Delete task
//@route    DELETE /api/taskman/:id
//@access   Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	//Make sure user is Task owner
	if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorised to delete this task`,
				401
			)
		);
	}

	task.deleteOne();

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
			if (!task) {
				return next(
					new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
				);
			}

			// Make sure user is task owner
			if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
				return next(
					new ErrorResponse(
						`User ${req.user.id} is not authorized to update this task`,
						401
					)
				);
			}

			if (!req.files) {
				return next(new ErrorResponse(`Please upload a file`, 400));
			}

			const file = req.files.file;

			// Make sure the image is a photo
			if (!file.mimetype.startsWith('image')) {
				return next(new ErrorResponse(`Please upload an image file`, 400));
			}
			//Check the file size
			if (file.size > parseInt(process.env.FILE_UPLOAD_LIMIT) * 1024 * 1024) {
				return next(
					new ErrorResponse(
						`File size exceeds the ${parseInt(
							process.env.FILE_UPLOAD_LIMIT
						)}MB limit`,
						400
					)
				);
			}
			console.log('Task:', task);
			console.log(req.body, req.file);
			res.send('Image uploaded successfully!');
		} catch (err) {
			console.error('Error during image upload:', err);
			return next(new ErrorResponse('Error during image upload', 500));
		}
	});
});

//@desc     Reset all tasks (DEVELOPMENT ONLY)
//@route    DELETE /api/taskman/reset
//@access   Private (Admin only)
exports.resetAllTasks = asyncHandler(async (req, res, next) => {
	// Only allow in development
	if (process.env.NODE_ENV === 'production') {
		return next(new ErrorResponse('Reset not allowed in production', 403));
	}

	// Only allow admins
	if (req.user.role !== 'admin') {
		return next(new ErrorResponse('Admin access required', 403));
	}

	await Tasks.deleteMany({});
	res.status(200).json({ success: true, message: 'All tasks deleted' });
});

//@desc     Share task with specific users
//@route    PUT /api/taskman/:id/share
//@access   Private
exports.shareTask = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure user is task owner
	if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to share this task`,
				403
			)
		);
	}

	const { userIds, isPublic } = req.body;

	// Update sharing settings
	if (userIds !== undefined) {
		task.sharedWith = userIds;
	}
	if (isPublic !== undefined) {
		task.isPublic = isPublic;
	}

	await task.save();

	res.status(200).json({ success: true, data: task });
});

//@desc     Toggle task public visibility
//@route    PUT /api/taskman/:id/toggle-public
//@access   Private
exports.togglePublic = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure user is task owner
	if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to modify this task`,
				403
			)
		);
	}

	// Toggle public status
	task.isPublic = !task.isPublic;
	await task.save();

	res.status(200).json({
		success: true,
		data: {
			_id: task._id,
			isPublic: task.isPublic,
		},
	});
});
