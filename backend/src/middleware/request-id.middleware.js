const { randomUUID } = require('node:crypto');

/**
 * Middleware to generate a unique request ID for each incoming request.
 * Attaches the ID to req.id and responds with X-Request-ID header.
 */
function requestIdMiddleware(req, res, next) {
  const requestId = randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

module.exports = requestIdMiddleware;
