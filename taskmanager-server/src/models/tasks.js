const mongoose = require('mongoose');
const slugify = require('slugify');
const taskSchema = new mongoose.Schema({
	task: {
		type: String,
		required: [true, 'Please add a task'],
		maxlength: [150, 'Task name cannot be longer than 150 characters'],
		unique: true,
		trim: true,
	},
	slug: String,
	description: {
		type: String,
		required: [true, 'Please add a description'],
	},
	dueDate: {
		type: Date,
	},
	priority: {
		type: String,
		enum: ['Low', 'Medium', 'High'],
		default: 'Medium',
	},
	status: {
		type: String,
		enum: ['Pending', 'In Progress', 'Completed'],
		default: 'Pending',
	},
	labels: {
		type: [String],
	},
	images: [
		{
			url: String,
			filename: String,
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Create task slug from task name
taskSchema.pre('save', function (next) {
	this.slug = slugify(this.task, { lower: true });
	next();
});

const Tasks = mongoose.model('Tasks', taskSchema, 'Tasks');

module.exports = Tasks;
