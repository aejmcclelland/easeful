const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const slugify = require('slugify');
const Tasks = require('../models/Tasks');

const multer = require('multer');
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({
	storage,
	limits: { fileSize: 1_048_576 }, // 1MB per image; adjust if desired
});
// NOTE: CloudinaryStorage.allowed_formats controls types server-side (jpeg/jpg/png/pdf).
// Multer `limits.fileSize` caps each file at 1MB. Adjust as needed.

// Expose multer middlewares for routes
exports.uploadTaskImages = upload.array('images', 5); // up to 5 images in one request
exports.uploadTaskImageSingle = upload.single('image'); // handy if you add a single-image endpoint

// Helper: ensure the current user owns the task or is admin
function ensureOwnerOrAdmin(task, req, action = 'perform this action') {
	const isOwner =
		task.user?.toString() === req.user._id?.toString?.() ||
		task.user?.toString() === req.user.id;
	if (!isOwner && req.user.role !== 'admin') {
		return new ErrorResponse(
			`User ${req.user.id} is not authorised to ${action}`,
			403
		);
	}
	return null;
}

//@desc     Get all tasks
//@route    GET /api/easeful
//@access   Private
exports.getTasks = asyncHandler(async (req, res, next) => {
	// Filter tasks by current user; allow optional status/priority/q filters
	const { status, priority, q } = req.query || {};

	const filter = { user: req.user._id || req.user.id };
	if (status) filter.status = status;
	if (priority) filter.priority = priority;
	if (q && typeof q === 'string' && q.trim()) {
		const rx = new RegExp(q.trim(), 'i');
		filter.$or = [{ task: rx }, { description: rx }, { labels: rx }];
	}

	const tasks = await Tasks.find(filter).sort({ dueDate: 1, createdAt: -1 });

	return res.status(200).json({
		success: true,
		count: tasks.length,
		data: tasks,
	});
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
	const maybeError = ensureOwnerOrAdmin(task, req, 'view this task');
	if (maybeError) return next(maybeError);

	res.status(200).json({ success: true, data: task });
});
//@desc     Create new task
//@route    POST /api/easeful
//@access   Private
exports.createTask = asyncHandler(async (req, res, next) => {
	try {
		// Add user to req.body
		req.body.user = req.user.id;

		// Ensure a title exists (accept either "task" or "name")
		const title = (req.body.task ?? req.body.name ?? '').toString().trim();
		if (!title) {
			return next(new ErrorResponse('Title is required', 400));
		}
		req.body.task = title;
		req.body.name = title;

		// Enforce max 5 images on create
		if (req.files && req.files.length > 5) {
			// Clean up any already-uploaded files to Cloudinary
			for (const f of req.files) {
				try { await cloudinary.uploader.destroy(f.filename); } catch (_) {}
			}
			return next(new ErrorResponse('You can attach at most 5 images to a task', 400));
		}

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
		const task = await Tasks.create({ ...req.body, images });
		res.status(201).json({ success: true, data: task });
	} catch (error) {
		console.error('Error creating task:', error);
		if (error?.name === 'ValidationError' && error.errors) {
			const message = Object.values(error.errors).map((e) => e.message).join('; ');
			return next(new ErrorResponse(message, 400));
		}
		if (error.code === 11000) {
			return next(new ErrorResponse('Task with this name already exists', 409));
		}
		return next(new ErrorResponse('Failed to create task', 500));
	}
});

//@desc     Upload images for task
//@route    PUT /api/easeful/:id/photo
//@access   Private
exports.taskPhotoUpload = asyncHandler(async (req, res, next) => {
	const { id } = req.params;
	const task = await Tasks.findById(id);

	if (!task) {
		return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
	}

	const maybeError = ensureOwnerOrAdmin(task, req, 'update this task');
	if (maybeError) return next(maybeError);

	// Ensure files were uploaded
	if (!Array.isArray(req.files) || req.files.length === 0) {
		return next(new ErrorResponse('Please upload at least one file', 400));
	}

	const MAX_IMAGES = 5;
	const currentCount = Array.isArray(task.images) ? task.images.length : 0;

	// If task already at cap, delete any just-uploaded files from Cloudinary and reject
	if (currentCount >= MAX_IMAGES) {
		for (const f of req.files) {
			try { await cloudinary.uploader.destroy(f.filename); } catch (_) {}
		}
		return next(new ErrorResponse(`Task already has maximum ${MAX_IMAGES} images`, 400));
	}

	// Determine how many from this batch we can accept
	const remaining = MAX_IMAGES - currentCount;
	const allowedCount = Math.min(remaining, req.files.length);

	// If the batch exceeds remaining capacity, delete the extra files from Cloudinary
	if (allowedCount < req.files.length) {
		for (let i = allowedCount; i < req.files.length; i++) {
			const over = req.files[i];
			try { await cloudinary.uploader.destroy(over.filename); } catch (_) {}
		}
	}

	// Map only the accepted files
	const acceptedFiles = req.files.slice(0, allowedCount);
	const newImages = acceptedFiles.map((file) => ({
		public_id: file.filename,     // Cloudinary public_id via CloudinaryStorage
		url: file.path,               // secure URL
		width: file.width || undefined,
		height: file.height || undefined,
		bytes: file.size || undefined,
	}));

	// Persist to task
	task.images = [...(task.images || []), ...newImages];
	await task.save();

	return res.status(200).json({
		success: true,
		count: newImages.length,
		data: task,
	});
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

	const maybeError = ensureOwnerOrAdmin(task, req, 'update this task');
	if (maybeError) return next(maybeError);

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
	const maybeError = ensureOwnerOrAdmin(task, req, 'update this task');
	if (maybeError) return next(maybeError);

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

	const maybeError = ensureOwnerOrAdmin(task, req, 'delete this task');
	if (maybeError) return next(maybeError);

	// Best-effort: clean up Cloudinary images for this task
	if (Array.isArray(task.images) && task.images.length) {
		for (const img of task.images) {
			if (!img?.public_id) continue;
			try { await cloudinary.uploader.destroy(img.public_id); } catch (_) {}
		}
	}

	await task.deleteOne();

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
