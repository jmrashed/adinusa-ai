require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const aiRoutes = require('./routes/ai.routes');
const logger = require('./utils/logger');
const requestIdMiddleware = require('./middleware/request-id.middleware');
const requestLoggerMiddleware = require('./middleware/request-logger.middleware');
const { ENV } = require('./config/env');
const compression = require('compression');

// Validate environment configuration before starting
try {
  validate();
} catch (err) {
  console.error('Failed to start server due to configuration errors:', err.message);
  process.exit(1);
}

const app = express();

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Request logging middleware
app.use(requestLoggerMiddleware);

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(ENV.REQUEST_TIMEOUT_MS);
  next();
});

// Compression middleware
app.use(compression());

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
app.use(cors({
  origin: ENV.ALLOWED_ORIGINS?.split(',') ?? ['vscode-webview://*'],
  methods: ['GET', 'POST'],
}));

// Rate limiting
app.use('/ai', rateLimit({
  windowMs: 60 * 1000,
  max: ENV.RATE_LIMIT,
  message: { error: 'Too many requests, please slow down.' },
}));

app.use(express.json({ limit: ENV.BODY_SIZE_LIMIT }));

// Routes
app.use('/ai', aiRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', version: process.env.npm_package_version ?? '0.1.0' }));

// 404
app.use((_, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, req, res, _next) => {
  logger.error(`Unhandled: ${err.message}`, req.id);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT ?? 3002;
const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Don't exit - let the process continue
});

module.exports = app;
