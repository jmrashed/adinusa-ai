/**
 * Centralized environment variable validation.
 * Fails fast at startup with clear error messages.
 */

'use strict';

const logger = require('../utils/logger');

const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3002', 10),

  // Rate limiting
  RATE_LIMIT: parseInt(process.env.RATE_LIMIT || '30', 10),

  // Agent
  MAX_AGENT_ITERATIONS: Math.min(parseInt(process.env.MAX_AGENT_ITERATIONS || '5', 10), 10),

  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'vscode-webview://*',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // LLM Providers (at least one should be configured for the app to be useful)
  DEFAULT_PROVIDER: process.env.DEFAULT_PROVIDER || 'glm',
  ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
  GLM_MODEL: process.env.GLM_MODEL || 'glm-4-flash',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',

  // Error monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Request timeout
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),

  // Body parser size limit
  BODY_SIZE_LIMIT: process.env.BODY_SIZE_LIMIT || '2mb',
};

const CRITICAL_VARS = [];

function validate() {
  const errors = [];

  // Port validation
  if (Number.isNaN(ENV.PORT) || ENV.PORT < 1 || ENV.PORT > 65535) {
    errors.push(`Invalid PORT: must be a number between 1 and 65535, got "${process.env.PORT}"`);
  }

  // Rate limit validation
  if (Number.isNaN(ENV.RATE_LIMIT) || ENV.RATE_LIMIT < 1) {
    errors.push(`Invalid RATE_LIMIT: must be a positive number, got "${process.env.RATE_LIMIT}"`);
  }

  // Iterations validation
  if (Number.isNaN(ENV.MAX_AGENT_ITERATIONS) || ENV.MAX_AGENT_ITERATIONS < 1) {
    errors.push(`Invalid MAX_AGENT_ITERATIONS: must be a positive number, got "${process.env.MAX_AGENT_ITERATIONS}"`);
  }

  // Log level validation
  const validLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLevels.includes(ENV.LOG_LEVEL.toLowerCase())) {
    errors.push(`Invalid LOG_LEVEL: must be one of ${validLevels.join(', ')}, got "${ENV.LOG_LEVEL}"`);
  }

  // Provider validation
  const validProviders = ['glm', 'openai', 'claude', 'gemini', 'ollama'];
  if (!validProviders.includes(ENV.DEFAULT_PROVIDER)) {
    errors.push(`Invalid DEFAULT_PROVIDER: must be one of ${validProviders.join(', ')}, got "${ENV.DEFAULT_PROVIDER}"`);
  }

  // Warn if no LLM keys are configured (except for ollama which is local)
  const hasAnyKey =
    ENV.ZHIPU_API_KEY ||
    ENV.OPENAI_API_KEY ||
    ENV.ANTHROPIC_API_KEY ||
    ENV.GEMINI_API_KEY;

  if (!hasAnyKey && ENV.DEFAULT_PROVIDER !== 'ollama') {
    logger.warn(
      'No LLM API keys configured and default provider is not ollama. ' +
        'Set at least one of: ZHIPU_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, ' +
        'or set DEFAULT_PROVIDER=ollama with OLLAMA_BASE_URL.'
    );
  }

  // Timeout validation
  if (Number.isNaN(ENV.REQUEST_TIMEOUT_MS) || ENV.REQUEST_TIMEOUT_MS < 1000) {
    errors.push(`Invalid REQUEST_TIMEOUT_MS: must be at least 1000ms, got "${process.env.REQUEST_TIMEOUT_MS}"`);
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed:');
    errors.forEach((err) => logger.error(`  - ${err}`));
    process.exit(1);
  }

  logger.info('Environment validation passed');
}

module.exports = { ENV, validate };

