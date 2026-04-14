const { runAgent } = require('../services/agent.service');
const logger = require('../utils/logger');

async function chat(req, res) {
  const { message, context } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }
  if (message.length > 8000) {
    return res.status(400).json({ error: 'message too long (max 8000 chars)' });
  }

  try {
    const result = await runAgent(message.trim(), context ?? {});
    res.json(result);
  } catch (err) {
    logger.error(`Chat error: ${err.message}`);
    res.status(500).json({ error: 'Agent failed to process request' });
  }
}

module.exports = { chat };
