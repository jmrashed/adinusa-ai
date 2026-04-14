require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const aiRoutes = require('./routes/ai.routes');
const logger = require('./utils/logger');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['vscode-webview://*'],
  methods: ['GET', 'POST'],
}));

// Rate limiting
app.use('/ai', rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT ?? '30'),
  message: { error: 'Too many requests, please slow down.' },
}));

app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/ai', aiRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', version: process.env.npm_package_version ?? '0.1.0' }));

// 404
app.use((_, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  logger.error(`Unhandled: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT ?? 3002;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

module.exports = app;
