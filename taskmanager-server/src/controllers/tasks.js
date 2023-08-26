const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const slugify = require('slugify');
const multer = require('multer');
const Tasks = require('../models/Tasks');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage: storage });

//@desc     Get all tasks
//@route    GET /api/taskman
//@access   Public
exports.getTasks = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
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
	//Add user to req.body
	req.body.user = req.user.id;

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

	//Check for published task
	const publishedTask = await Tasks.findOne({ user: req.user.id });

	//if the user is not the publisher, they cannot view
	if (publishedTask && req.user.role !== 'admin') {
		return next(
			new ErrorResponse(
				`The user with ID ${req.user.id} has already published this task`,
				400
			)
		);
	}
	const task = await Tasks.create({ ...req.body, images: images });
	res.status(201).json({ success: true, data: task });
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
