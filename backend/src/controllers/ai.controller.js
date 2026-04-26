const { runAgent } = require('../services/agent.service');
const logger = require('../utils/logger');

const VALID_PROVIDERS = ['glm', 'openai', 'claude', 'gemini', 'ollama'];

async function chat(req, res) {
  const { message, context, modelConfig } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }
  if (message.length > 8000) {
    return res.status(400).json({ error: 'message too long (max 8000 chars)' });
  }
  if (modelConfig?.provider && !VALID_PROVIDERS.includes(modelConfig.provider)) {
    return res.status(400).json({ error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}` });
  }
  if (!context?.workspaceRoot || typeof context.workspaceRoot !== 'string') {
    return res.status(400).json({ error: 'workspaceRoot is required. Open a workspace folder in VS Code and try again.' });
  }

  try {
    const result = await runAgent(message.trim(), context ?? {}, modelConfig ?? {});
    res.json(result);
  } catch (err) {
    logger.error(`Chat error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { chat };
