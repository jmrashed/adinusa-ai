/**
 * Production-grade global error handler.
 * - Logs structured error details with request ID
 * - Returns generic message in production (no stack leak)
 * - Returns stack in development for debugging
 * - Integrates with Sentry if configured
 */

'use strict';

const { ENV } = require('../config/env');
const logger = require('../utils/logger');

let Sentry;
try {
  if (ENV.SENTRY_DSN) {
    Sentry = require('@sentry/node');
  }
} catch {
  // Sentry not installed
}

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;

  const errorMeta = {
    requestId: req.id,
    method: req.method,
    path: req.path,
    statusCode,
    errorName: err.name,
    errorMessage: err.message,
    stack: isServerError ? err.stack : undefined,
  };

  if (isServerError) {
    logger.error(`Unhandled error: ${err.message}`, errorMeta);

    // Send to Sentry if configured
    if (Sentry) {
      Sentry.captureException(err, {
        tags: { requestId: req.id },
        extra: { path: req.path, method: req.method },
      });
    }
  } else {
    logger.warn(`Client error: ${err.message}`, errorMeta);
  }

  const response = {
    error: isServerError ? 'Internal server error' : err.message,
    requestId: req.id,
  };

  // Include stack in development only
  if (ENV.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack.split('\n');
  }

  res.status(statusCode).json(response);
}

module.exports = { errorHandler };

