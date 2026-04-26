/**
 * Request ID / Correlation ID middleware.
 * Generates a unique request ID or forwards one from the incoming header.
 * Attaches it to req.id and sets it on the response header for tracing.
 */

'use strict';

const crypto = require('crypto');

const HEADER_NAME = 'x-request-id';

function requestIdMiddleware(req, res, next) {
  const id = req.get(HEADER_NAME) || crypto.randomUUID();
  req.id = id;
  res.set(HEADER_NAME, id);
  next();
}

module.exports = { requestIdMiddleware, HEADER_NAME };

