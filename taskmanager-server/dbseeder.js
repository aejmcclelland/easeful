const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//Load env variables
dotenv.config({ path: '../taskmanager-server/.env' });

// Check if the MONGO_URI is loaded
console.log('MONGO_URI:', process.env.MONGO_URI);

//connect to DB
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 30000, // Increase this timeout value
});

const db = mongoose.connection;

// Listen for the connection event
db.on('connected', () => {
	console.log(`Connected to MongoDB at ${db.host}:${db.port}`.cyan.bold);
});

// Listen for errors
db.on('error', err => {
	console.error(`MongoDB connection error: ${err.message}`.red.bold);
});

db.once('open', () => {
	//Load models
	const Tasks = require('./src/models/Tasks');
	const Users = require('./src/models/User');
	//Read JSOn files
	const tasks = JSON.parse(
		fs.readFileSync(`${__dirname}/data/tasks.json`, 'utf-8')
	);

	const users = JSON.parse(
		fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
	);

	tasks.forEach(task => {
		// Convert the dueDate string to a Date object
		task.dueDate = new Date(task.dueDate);
	});

	//Import into DB
	const importData = async () => {
		try {
			await Tasks.create(tasks);
			await Users.create(users);
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
			await Tasks.deleteMany();
			await Users.deleteMany();
			console.log('Data Destroyed...'.red.inverse);
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
});
