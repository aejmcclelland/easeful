const advancedResults = (model, populate) => async (req, res, next) => {
	let query;

	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude (extended for task-specific filtering)
	const removeFields = ['select', 'sort', 'page', 'limit', 'q', 'labels', 'status', 'priority', 'dueFrom', 'dueTo', 'scope'];

	// Handle special task filters before removing them
	let specialFilters = {};

	// Text search (q parameter)
	if (req.query.q) {
		specialFilters.$or = [
			{ task: { $regex: req.query.q, $options: 'i' } },
			{ description: { $regex: req.query.q, $options: 'i' } }
		];
	}

	// Labels filter (comma-separated, any-match logic)
	if (req.query.labels) {
		const labelsArray = req.query.labels.split(',').map(label => label.trim());
		specialFilters.labels = { $in: labelsArray };
	}

	// Status filter (comma-separated multi-select)
	if (req.query.status) {
		const statusArray = req.query.status.split(',').map(status => status.trim());
		specialFilters.status = { $in: statusArray };
	}

	// Priority filter (comma-separated multi-select)
	if (req.query.priority) {
		const priorityArray = req.query.priority.split(',').map(priority => priority.trim());
		specialFilters.priority = { $in: priorityArray };
	}

	// Due date range filter
	if (req.query.dueFrom || req.query.dueTo) {
		specialFilters.dueDate = {};
		if (req.query.dueFrom) {
			specialFilters.dueDate.$gte = new Date(req.query.dueFrom);
		}
		if (req.query.dueTo) {
			specialFilters.dueDate.$lte = new Date(req.query.dueTo);
		}
	}

	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach(param => delete reqQuery[param]);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);

	// Create operators ($gt, $gte, etc)
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

	// Combine base query with special filters
	const baseQuery = JSON.parse(queryStr);
	const finalQuery = { ...baseQuery, ...specialFilters };

	// Finding resource
	query = model.find(finalQuery);

	// Select Fields
	if (req.query.select) {
		const fields = req.query.select.split(',').join(' ');
		query = query.select(fields);
	}

	// Sort with business logic
	if (req.query.sort) {
		const sortFields = req.query.sort.split(',');
		let sortObject = {};
		
		sortFields.forEach(field => {
			const isDesc = field.startsWith('-');
			const fieldName = isDesc ? field.substring(1) : field;
			
			if (fieldName === 'priority') {
				// Business priority order: High → Medium → Low
				// Map to numeric values for proper sorting
				const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
				// For descending (-priority), we want High first (3,2,1)
				// For ascending (priority), we want Low first (1,2,3)
				sortObject[fieldName] = isDesc ? -1 : 1;
			} else {
				sortObject[fieldName] = isDesc ? -1 : 1;
			}
		});
		
		query = query.sort(sortObject);
	} else {
		query = query.sort({ createdAt: -1 }); // Default: newest first
	}

	// Pagination  
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10; // Default 10 per page as per plan
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments(finalQuery);

	query = query.skip(startIndex).limit(limit);

	if (populate) {
		query = query.populate(populate);
	}

	// Executing query
	const results = await query;

	// Pagination result
	const pagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit,
		};
	}

	res.advancedResults = {
		success: true,
		count: results.length,
		total: total,
		pagination: {
			...pagination,
			currentPage: page,
			totalPages: Math.ceil(total / limit),
		},
		data: results,
	};

	next();
};
module.exports = advancedResults;
