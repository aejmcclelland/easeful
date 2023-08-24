const advancedResults = (model, populate) => async (res, req, next) => {};
let query;

// copy req.query
const reqQuery = { ...req.query };

// fields to exclude
const removeFields = ['select', 'sort', 'page', 'limit'];

// loop over removeFelds and delete from reqQuery
removeFields.forEach(param => delete reqQuery[param]);

// create query string form query params
let queryStr = JSON.stringify(reqQuery);

// replace takes in regex of any operator ($gt, $gte, etc)
queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

// set query to queryStr to find resource
query = model.find(JSON.parse(queryStr));

// select fields
if (req.query.select) {
	const fields = req.query.select.split(',').join(' ');
	query = query.select(fields);
}
// Sort
if (req.query.sort) {
	const sortBy = req.query.sort.split(',').join(' ');
	query = query.sort(sortBy);
} else {
	query = query.sort({ createdAt: 'asc', name: -1 });
}

//Pagination
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 10;
const startIndex = (page - 1) * limit;
const endIndex = page * limit;
const total = await model.countDocuments(JSON.parse(queryStr));

query = query.skip(startIndex).limit(limit);

if (populate) {
	query = query.populate(populate);
}
// Execute query
const results = await query;

//Pagination result
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
	pagination,
	data: results,
};
next();

module.exports = advancedResults;
