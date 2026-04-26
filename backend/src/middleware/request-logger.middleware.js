const logger = require('./logger');

/**
 * Middleware to log incoming requests with request ID
 */
function requestLoggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestId = req.id || 'unknown';
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      requestId
    );
  });

  next();
}

module.exports = requestLoggerMiddleware;
