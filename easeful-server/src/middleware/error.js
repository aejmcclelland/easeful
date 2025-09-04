const ErrorResponse = require('../utils/errorResponse');

/**
 * Centralised error handler
 *
 * Responsibilities
 * - Preserve explicit ErrorResponse status codes/messages from controllers
 * - Normalise common library errors (Mongoose, Multer, JSON parse, etc.)
 * - Avoid leaking internals in production; include stack only in development
 */
const errorHandler = (err, req, res, next) => {
  // Start with defaults
  let status = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // --- MONGOOSE ERRORS ---
  // Invalid ObjectId -> 404 Not Found
  if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  }

  // Duplicate key -> 409 Conflict
  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate field value entered';
  }

  // Validation error -> 400 Bad Request
  if (err.name === 'ValidationError') {
    status = 400;
    // Collect all field messages
    const msgs = Object.values(err.errors || {}).map(v => v.message).filter(Boolean);
    message = msgs.length ? msgs.join(', ') : 'Validation failed';
  }

  // --- BODY PARSER / JSON ERRORS ---
  // Invalid JSON payloads
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON payload';
  }

  // --- AUTH / PERMISSION HINTS ---
  // Some libs throw generic UnauthorizedError; map to 401
  if (err.name === 'UnauthorizedError') {
    status = 401;
    message = message || 'Unauthorized';
  }

  // --- MULTER / UPLOAD ERRORS ---
  if (err.name === 'MulterError') {
    // LIMIT_FILE_SIZE -> 413 Payload Too Large
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      message = 'Uploaded file is too large';
    } else {
      status = 400;
      message = err.message || 'File upload error';
    }
  }

  // --- CLOUDINARY (best-effort normalisation) ---
  if (err.name === 'CloudinaryError' || typeof err.http_code === 'number') {
    status = err.http_code || 502;
    message = err.message || 'Image service error';
  }

  // Build payload
  const payload = {
    success: false,
    error: message,
  };

  // Add stack only in development
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

module.exports = errorHandler;
