const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`.magenta.inverse);
		console.log(mongoose.connection.readyState);
	} catch (error) {
		console.error(error);
		process.exit(1); // Exit the process if unable to connect to the database
	}
};

module.exports = connectDB;
