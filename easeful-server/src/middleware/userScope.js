/**
 * User Scope Middleware
 * 
 * This middleware ensures that all task queries are scoped to the authenticated user.
 * It runs BEFORE advancedResults to ensure the user filter is applied.
 * 
 * CRITICAL SECURITY: All users can only see their own tasks - NO EXCEPTIONS
 */

const userScope = (req, res, next) => {
	// Ensure user is authenticated (this should be guaranteed by protect middleware)
	if (!req.user || !req.user.id) {
		return res.status(401).json({
			success: false,
			error: 'Authentication required'
		});
	}

	// Force user filter - ALL users can only see their own tasks
	req.query.user = req.user.id;
	
	next();
};

module.exports = userScope;