/**
 * Per-request structured logging middleware.
 * Logs method, path, status code, duration, and request ID for every request.
 */

'use strict';

const logger = require('../utils/logger');

function requestLoggerMiddleware(req, res, next) {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection?.remoteAddress,
    };

    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.path} ${res.statusCode} ${logData.durationMs}ms`, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.path} ${res.statusCode} ${logData.durationMs}ms`, logData);
    } else {
      logger.info(`${req.method} ${req.path} ${res.statusCode} ${logData.durationMs}ms`, logData);
    }
  });

  next();
}

module.exports = { requestLoggerMiddleware };

