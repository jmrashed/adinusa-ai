/**
 * Structured JSON logger with configurable log levels.
 * Outputs JSON in production, pretty-printed in development.
 */

'use strict';

const { ENV } = require('../config/env');

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
};

const CURRENT_LEVEL = LEVELS[ENV.LOG_LEVEL.toLowerCase()] ?? LEVELS.info;
const SERVICE = 'adinusa-ai-backend';

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    service: SERVICE,
    message,
    ...meta,
  };

  // In production or when explicitly set, output JSON
  if (ENV.NODE_ENV === 'production' || process.env.LOG_FORMAT === 'json') {
    return JSON.stringify(logEntry);
  }

  // Pretty print for development
  const color = COLORS[level] || '';
  const reset = COLORS.reset;
  const requestIdStr = meta.requestId ? ` [${meta.requestId}]` : '';
  return `${color}[${logEntry.level}]${reset}${requestIdStr} ${message}`;
}

function log(level, message, meta) {
  const numericLevel = LEVELS[level] ?? LEVELS.info;
  if (numericLevel < CURRENT_LEVEL) {
    return;
  }

  const formatted = formatMessage(level, message, meta);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

const logger = {
  debug: (message, meta) => log('debug', message, meta),
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),

  /**
   * Create a child logger with bound metadata.
   * Useful for attaching requestId to all logs in a request context.
   */
  child: (boundMeta) => ({
    debug: (message, meta) => log('debug', message, { ...boundMeta, ...meta }),
    info: (message, meta) => log('info', message, { ...boundMeta, ...meta }),
    warn: (message, meta) => log('warn', message, { ...boundMeta, ...meta }),
    error: (message, meta) => log('error', message, { ...boundMeta, ...meta }),
  }),
};

module.exports = logger;

