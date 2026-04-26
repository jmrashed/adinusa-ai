/**
 * Backward-compatible logger re-export.
 * New code should use structuredLogger directly for full JSON capabilities.
 */

const structuredLogger = require('./structuredLogger');

/**
 * Wrap the structured logger to maintain backward compatibility
 * with existing code that passes reqId as a second argument.
 */
function wrap(method) {
  return (msg, reqId = null) => {
    const meta = reqId ? { requestId: reqId } : undefined;
    structuredLogger[method](msg, meta);
  };
}

module.exports = {
  info: wrap('info'),
  warn: wrap('warn'),
  error: wrap('error'),
  debug: wrap('debug'),
};


