/**
 * Comprehensive script to fix ALL user role issues
 * This normalizes all user roles to valid values
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

const fixAllUserRoles = async () => {
	try {
		await connectDB();
		
		// Define valid roles
		const validRoles = ['user', 'publisher', 'admin'];
		
		// First, let's see ALL users in the database
		const allUsers = await User.find({});
		console.log(`\n=== COMPREHENSIVE USER ROLE ANALYSIS ===`);
		console.log(`Total users in database: ${allUsers.length}`);
		
		if (allUsers.length > 0) {
			console.log('\nAll users in database:');
			allUsers.forEach((user, index) => {
				const isValidRole = validRoles.includes(user.role);
				const status = isValidRole ? '✅' : '❌ INVALID';
				console.log(`${index + 1}. ${user.name} (${user.email}) - Role: "${user.role}" ${status} - ID: ${user._id}`);
			});
		}
		
		// Find users with invalid/problematic roles
		const problematicUsers = await User.find({
			$or: [
				{ role: 'publisher' },           // Should be 'user' for normal users
				{ role: 'publisheruser' },       // Corrupted role
				{ role: { $nin: validRoles } }   // Any invalid role
			]
		});
		
		console.log(`\n=== ROLE FIXES NEEDED ===`);
		console.log(`Found ${problematicUsers.length} users with problematic roles`);
		
		if (problematicUsers.length > 0) {
			console.log('\nUsers to be fixed:');
			problematicUsers.forEach(user => {
				let targetRole = 'user'; // Default fix
				let reason = 'normalizing to user';
				
				// Special case: keep admin role if it exists
				if (user.role === 'admin') {
					targetRole = 'admin';
					reason = 'keeping admin role';
				}
				// Special case: if email contains 'admin', make them admin
				else if (user.email.includes('admin')) {
					targetRole = 'admin';
					reason = 'detected admin email';
				}
				
				console.log(`- ${user.name} (${user.email}): "${user.role}" → "${targetRole}" (${reason})`);
			});
			
			// Perform the updates
			console.log('\n=== APPLYING FIXES ===');
			
			// Fix publisher and corrupted roles to 'user'
			const userUpdate = await User.updateMany(
				{ 
					$or: [
						{ role: 'publisher' },
						{ role: 'publisheruser' },
						{ role: { $nin: validRoles } }
					],
					email: { $not: /admin/i }  // Don't touch admin emails
				}, 
				{ $set: { role: 'user' } }
			);
			
			// Fix admin emails to have admin role
			const adminUpdate = await User.updateMany(
				{ email: /admin/i },
				{ $set: { role: 'admin' } }
			);
			
			console.log(`✅ Updated ${userUpdate.modifiedCount} users to 'user' role`);
			console.log(`✅ Updated ${adminUpdate.modifiedCount} admin emails to 'admin' role`);
			
			// Show final distribution after update
			const finalUsers = await User.find({});
			console.log('\n=== FINAL RESULTS ===');
			finalUsers.forEach((user, index) => {
				console.log(`${index + 1}. ${user.name} (${user.email}) - Role: "${user.role}" ✅`);
			});
			
			const finalCounts = await User.aggregate([
				{ $group: { _id: '$role', count: { $sum: 1 } } }
			]);
			
			console.log('\nFinal user role distribution:');
			finalCounts.forEach(roleCount => {
				console.log(`- ${roleCount._id}: ${roleCount.count} users`);
			});
		} else {
			console.log('✅ All user roles are already correct - no updates needed');
		}
		
	} catch (error) {
		console.error('❌ Error fixing user roles:', error);
	} finally {
		await mongoose.connection.close();
		console.log('\n🔒 Database connection closed');
	}
};

// Run the comprehensive fix
if (require.main === module) {
	fixAllUserRoles();
}

module.exports = { fixAllUserRoles };