const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./src/middleware/error');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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

//Cookie parser
app.use(cookieParser());
//Limit file upload size
app.use(
	fileupload({
		limits: { fileSize: parseInt(process.env.FILE_UPLOAD_LIMIT) },
	})
);
//Route files
const tasks = require('./src/routes/tasks');
const auth = require('./src/routes/auth');

app.use('/api/taskman', tasks);
app.use('/api/auth', auth); //mount routers

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
