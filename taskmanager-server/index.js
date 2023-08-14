const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./src/middleware/error');
const cors = require('cors');
//Load env variables
dotenv.config({ path: '../taskmanager-server/.env' });

const connectDB = require('./src/config/db');
//connect to the database
connectDB();

const app = express();

//use CORS middleware
// Allow requests from localhost:3001 (your React app's development server)
app.use(
	cors({
		origin: 'http://localhost:3001',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);
//Development logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}
//Body parser
app.use(express.json());

//Route files
const tasks = require('./src/routes/tasks');

app.use('/api/taskman', tasks); //mount routers

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`);
	//Close server & exit process
	server.close(() => process.exit(1));
});
