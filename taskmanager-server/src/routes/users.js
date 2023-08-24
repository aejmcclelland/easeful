const express = require('express');

const {
	getAllUsers,
	getUser,
	updateUser,
	createUser,
	deleteUser,
} = require('../controllers/users');

const User = require('../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedresults');
const { protect, authorise } = require('../middleware/auth');

router.use(protect);
router.use(authorise('admin'));

router.route('/').get(advancedResults(User), getAllUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
