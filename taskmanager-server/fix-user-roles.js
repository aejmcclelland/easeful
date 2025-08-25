/**
 * Script to fix user roles in the database
 * This updates all users with role 'publisher' to role 'user'
 * since normal users should not have publisher permissions
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');

// Load environment variables
require('dotenv').config();

// Database connection
const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI;
	if (!mongoUri) {
		throw new Error('MONGO_URI not found in environment variables');
	}
	
	console.log('Connecting to MongoDB...');
	const conn = await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	console.log(`MongoDB connected: ${conn.connection.host}`);
	console.log(`Database name: ${conn.connection.name}`);
};

const fixUserRoles = async () => {
	try {
		await connectDB();
		
		// First, let's see ALL users in the database
		const allUsers = await User.find({});
		console.log(`\n=== DATABASE ANALYSIS ===`);
		console.log(`Total users in database: ${allUsers.length}`);
		
		if (allUsers.length > 0) {
			console.log('\nAll users in database:');
			allUsers.forEach((user, index) => {
				console.log(`${index + 1}. ${user.name} (${user.email}) - Role: "${user.role}" - ID: ${user._id}`);
			});
		}
		
		// Show count of users by role
		const userCounts = await User.aggregate([
			{ $group: { _id: '$role', count: { $sum: 1 } } }
		]);
		
		console.log('\nUser role distribution:');
		if (userCounts.length > 0) {
			userCounts.forEach(roleCount => {
				console.log(`- ${roleCount._id}: ${roleCount.count} users`);
			});
		} else {
			console.log('- No users found or no roles assigned');
		}
		
		// Find all users with role 'publisher'
		const publisherUsers = await User.find({ role: 'publisher' });
		console.log(`\n=== PUBLISHER ROLE FIX ===`);
		console.log(`Found ${publisherUsers.length} users with 'publisher' role`);
		
		if (publisherUsers.length > 0) {
			console.log('Users to be updated:');
			publisherUsers.forEach(user => {
				console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
			});
			
			// Update all publisher users to 'user' role
			const result = await User.updateMany(
				{ role: 'publisher' }, 
				{ $set: { role: 'user' } }
			);
			
			console.log(`\nUpdated ${result.modifiedCount} users from 'publisher' to 'user' role`);
			
			// Show final distribution after update
			const finalCounts = await User.aggregate([
				{ $group: { _id: '$role', count: { $sum: 1 } } }
			]);
			
			console.log('\nFinal user role distribution after update:');
			finalCounts.forEach(roleCount => {
				console.log(`- ${roleCount._id}: ${roleCount.count} users`);
			});
		} else {
			console.log('No users with publisher role found - no updates needed');
		}
		
	} catch (error) {
		console.error('Error fixing user roles:', error);
	} finally {
		await mongoose.connection.close();
		console.log('\nDatabase connection closed');
	}
};

// Run the fix
if (require.main === module) {
	fixUserRoles();
}

module.exports = { fixUserRoles };