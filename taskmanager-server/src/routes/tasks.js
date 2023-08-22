const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage: storage });

const {
	getTasks,
	getTask,
	createTask,
	updateTask,
	deleteTask,
	taskPhotoUpload,
} = require('../controllers/tasks');

const router = express.Router();

const { protect } = require('../middleware/auth');

router
	.route('/')
	.get(getTasks)
	.post(protect, upload.array('images'), createTask);

router
	.route('/:id')
	.get(getTask)
	.put(protect, updateTask)
	.delete(protect, deleteTask);

router
	.route('/:id/photo')
	.put(protect, taskPhotoUpload)
	.post(protect, taskPhotoUpload);

module.exports = router;
