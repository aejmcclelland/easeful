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

router.route('/').get(getTasks).post(upload.array('images'), createTask);

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

router.route('/:id/photo').put(taskPhotoUpload).post(taskPhotoUpload);

module.exports = router;
