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

const Tasks = require('../models/Tasks');

const router = express.Router();

const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');

router
	.route('/:id/photo')
	.put(protect, authorise('publisher', 'admin'), taskPhotoUpload)
	.post(protect, authorise('publisher', 'admin'), taskPhotoUpload);

router
	.route('/')
	.get(advancedResults(Tasks), getTasks)
	.post(
		protect,
		authorise('publisher', 'admin'),
		upload.array('images'),
		createTask
	);

router
	.route('/:id')
	.get(getTask)
	.put(protect, authorise('publisher', 'admin'), updateTask)
	.delete(protect, authorise('publisher', 'admin'), deleteTask);

module.exports = router;
