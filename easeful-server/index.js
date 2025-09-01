require('dotenv').config();

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./src/middleware/error');
const cors = require('cors');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const connectDB = require('./src/config/db');
//connect to the database
connectDB();

const app = express();

app.set('trust proxy', 1);

try {
	if (process.env.MONGO_URI) {
		const u = new URL(process.env.MONGO_URI);
		console.log('Mongo user from URI:', u.username);
	} else {
		console.warn('MONGO_URI not set');
	}
} catch (e) {
	console.warn('Unable to parse MONGO_URI:', e.message);
}
//use CORS middleware
// Allow requests from localhost:3001 (your React app's development server)
const allowedOrigins = [
	'http://localhost:3000', // Next.js dev server
	'http://localhost:3001', // React dev server (if used)
	'https://taskmanager-taskmanager-client.vercel.app',
	/\.vercel\.app$/,
];

app.use(
	cors({
		origin: allowedOrigins,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
);
//Development logging middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
	app.use((req, res, next) => {
		if (req.url.includes('/api/easeful')) {
			console.log(
				`>>> ${req.method} ${req.url} - Content-Type: ${req.get(
					'Content-Type'
				)}`
			);
		}
		next();
	});
}

//Body parser - only parse JSON for application/json requests
app.use(
	express.json({
		type: 'application/json',
	})
);
//Cookie parser
app.use(cookieParser());
// Sanatise data
app.use(mongoSanitize());
// Set secure headers
app.use(helmet());
//Prevent cross site scripting
app.use(xss());
//Rate limit
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, //10 minutes
	max: 100,
	standardHeaders: true,
});

app.use(limiter);
//Prevent http param pollution
app.use(hpp());

//Route files
const tasks = require('./src/routes/tasks');
const auth = require('./src/routes/auth');
const users = require('./src/routes/users');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/easeful', tasks);
app.use('/api/auth', auth); //mount routers
app.use('/api/users', users); //mount routers

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	);
});

//Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	console.log(`Error: ${err.message}`);
	//Close server & exit process
	server.close(() => process.exit(1));
});
