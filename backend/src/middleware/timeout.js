/**
 * Request timeout standardization middleware.
 * Adds a timeout to requests and responds with 408 if exceeded.
 */

'use strict';

const { ENV } = require('../config/env');
const logger = require('../utils/logger');

const DEFAULT_TIMEOUT_MS = ENV.REQUEST_TIMEOUT_MS;

function timeoutMiddleware(timeoutMs = DEFAULT_TIMEOUT_MS) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn(`Request timeout: ${req.method} ${req.path}`, { requestId: req.id });
        res.status(408).json({
          error: 'Request timeout',
          message: `Request exceeded ${timeoutMs}ms`,
          requestId: req.id,
        });
      }
    }, timeoutMs);

    // Hook into response finish to clear timer
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}

module.exports = { timeoutMiddleware };

