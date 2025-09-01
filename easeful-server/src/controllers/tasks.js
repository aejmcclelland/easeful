const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const slugify = require('slugify');
const multer = require('multer');
const Tasks = require('../models/Tasks');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage: storage });

//@desc     Get all tasks
//@route    GET /api/easeful
//@access   Private
exports.getTasks = asyncHandler(async (req, res, next) => {
	// userScope middleware has already added the user filter
	// advancedResults middleware has already executed the user-scoped query
	res.status(200).json(res.advancedResults);
});

//@desc     Get one task
//@route    GET /api/easeful/:id
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
//@route    POST /api/easeful
//@access   Private
exports.createTask = asyncHandler(async (req, res, next) => {
	try {
		//Add user to req.body
		req.body.user = req.user.id;

		// Process uploaded images from Cloudinary
		const images = [];
		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				images.push({
					public_id: file.filename, // Cloudinary returns filename as the public_id
					url: file.path, // Cloudinary returns path as the secure URL
					width: file.width || undefined,
					height: file.height || undefined,
					bytes: file.size || undefined,
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

//@desc     Upload images for task
//@route    PUT /api/easeful/:id/photo
//@access   Private
exports.taskPhotoUpload = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure user is task owner or admin
	if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update this task`,
				401
			)
		);
	}

	// Check current image count
	const currentCount = task.images ? task.images.length : 0;
	const maxImages = 6;

	if (currentCount >= maxImages) {
		return next(
			new ErrorResponse(`Task already has maximum ${maxImages} images`, 400)
		);
	}

	// Check if files were uploaded
	if (!req.files || req.files.length === 0) {
		return next(new ErrorResponse('Please upload at least one file', 400));
	}

	// Check if upload would exceed limit
	const uploadCount = req.files.length;
	if (currentCount + uploadCount > maxImages) {
		return next(
			new ErrorResponse(
				`Can only upload ${
					maxImages - currentCount
				} more images (${uploadCount} provided)`,
				400
			)
		);
	}

	try {
		// Process uploaded images from Cloudinary
		const newImages = req.files.map((file) => ({
			public_id: file.filename, // Cloudinary returns filename as the public_id
			url: file.path, // Cloudinary returns path as the secure URL
			width: file.width || undefined,
			height: file.height || undefined,
			bytes: file.size || undefined,
		}));

		// Add new images to existing ones
		const updatedImages = [...(task.images || []), ...newImages];

		// Update task with new images
		const updatedTask = await Tasks.findByIdAndUpdate(
			req.params.id,
			{ images: updatedImages },
			{ new: true, runValidators: true }
		);

		res.status(200).json({
			success: true,
			count: newImages.length,
			data: updatedTask,
		});
	} catch (error) {
		console.error('Error uploading images:', error);
		return next(new ErrorResponse('Problem with file upload', 500));
	}
});

//@desc     Delete single image from task
//@route    DELETE /api/easeful/:id/photo/:public_id
//@access   Private
exports.deleteTaskImage = asyncHandler(async (req, res, next) => {
	const task = await Tasks.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	// Make sure user is task owner or admin
	if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`User ${req.user.id} is not authorized to update this task`,
				401
			)
		);
	}

	const { public_id } = req.params;
	const decodedPublicId = decodeURIComponent(public_id);

	// Find the image in the task
	const imageIndex = task.images.findIndex(
		(img) => img.public_id === decodedPublicId
	);

	if (imageIndex === -1) {
		return next(new ErrorResponse('Image not found', 404));
	}

	try {
		// Delete from Cloudinary
		const cloudinary = require('cloudinary').v2;
		await cloudinary.uploader.destroy(decodedPublicId);

		// Remove from task
		task.images.splice(imageIndex, 1);
		await task.save();

		res.status(200).json({
			success: true,
			data: task,
		});
	} catch (error) {
		console.error('Error deleting image:', error);
		return next(new ErrorResponse('Problem deleting image', 500));
	}
});

//@desc     Update task
//@route    PUT /api/easeful/:id
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
//@route    DELETE /api/easeful/:id
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

//@desc     Reset all tasks (DEVELOPMENT ONLY)
//@route    DELETE /api/easeful/reset
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
//@route    PUT /api/easeful/:id/share
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
//@route    PUT /api/easeful/:id/toggle-public
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
