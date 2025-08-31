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
	deleteTaskImage,
	resetAllTasks,
	shareTask,
	togglePublic,
} = require('../controllers/tasks');

const Tasks = require('../models/Tasks');

const router = express.Router();

const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');
const userScope = require('../middleware/userScope');
const { taskValidation, taskQueryValidation } = require('../middleware/validation');

// Require authentication for all task routes
router.use(protect);

// Reset route (DEVELOPMENT ONLY)
router.delete('/reset', resetAllTasks);


router.route('/:id/photo').put(upload.array('images', 6), taskPhotoUpload);
router.route('/:id/photo/:public_id').delete(deleteTaskImage);

router.route('/').get(userScope, taskQueryValidation, advancedResults(Tasks), getTasks).post((req, res, next) => {
	console.log('POST /api/easeful route hit!');
	next();
}, upload.array('images', 5), createTask); // Allow up to 5 images, optional

router.route('/:id').get(getTask).put(taskValidation, updateTask).delete(deleteTask);

// Sharing routes
router.put('/:id/share', shareTask);
router.put('/:id/toggle-public', togglePublic);

module.exports = router;
