const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//Load env variables
dotenv.config();

//Load models
const Task = require('./src/models/tasks');

//connect to DB
mongoose.connect(process.env.MONGO_URI);

//Read JSOn files
const tasks = JSON.parse(
	fs.readFileSync(`${__dirname}/data/tasks.json`, 'utf-8')
);

tasks.forEach(task => {
	// Convert the dueDate string to a Date object
	task.dueDate = new Date(task.dueDate);
});

//Import into DB
const importData = async () => {
	try {
		await Task.insertMany(tasks);
		console.log('Data Imported...'.green.inverse);
		process.exit();
	} catch (err) {
		console.error('Error importing data:', err);
		console.error(err.stack);
		process.exit(1);
	}
};
//Delete data from DB
const deleteData = async () => {
	try {
		await Task.deleteMany();
		console.log('Data Destroyed...'.green.inverse);
		process.exit();
	} catch (err) {
		console.error('Error deleting data:', err);
		process.exit(err);
	}
};
if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
}
