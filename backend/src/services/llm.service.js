const axios = require('axios');

// ── GLM (Zhipu) ──────────────────────────────────────────────────────────────
async function callGLM(messages, config) {
  const apiKey = config.apiKey || process.env.ZHIPU_API_KEY;
  if (!apiKey) throw new Error('GLM API key not set');

  const res = await axios.post(
    'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    {
      model: config.model || process.env.GLM_MODEL || 'glm-4-flash',
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  const content = res.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from GLM');
  return content;
}

// ── OpenAI (GPT-4) ───────────────────────────────────────────────────────────
async function callOpenAI(messages, config) {
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not set');

  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: config.model || 'gpt-4o',
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  const content = res.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');
  return content;
}

// ── Anthropic (Claude) ───────────────────────────────────────────────────────
async function callClaude(messages, config) {
  const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Anthropic API key not set');

  // Claude uses system message separately
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const res = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemMsg?.content ?? '',
      messages: chatMessages,
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );
  const content = res.data?.content?.[0]?.text;
  if (!content) throw new Error('Empty response from Claude');
  return content;
}

// ── Google Gemini ────────────────────────────────────────────────────────────
async function callGemini(messages, config) {
  const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not set');

  const model = config.model || 'gemini-1.5-pro';

  // Convert messages to Gemini format
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const contents = chatMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
  };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    body,
    { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
  );
  const content = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('Empty response from Gemini');
  return content;
}

// ── Ollama (local LLaMA / any model) ────────────────────────────────────────
async function callOllama(messages, config) {
  const baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = config.model || 'llama3';

  const res = await axios.post(
    `${baseUrl}/api/chat`,
    { model, messages, stream: false, options: { temperature: 0.3 } },
    { headers: { 'Content-Type': 'application/json' }, timeout: 120000 }
  );
  const content = res.data?.message?.content;
  if (!content) throw new Error('Empty response from Ollama');
  return content;
}

// ── Router ───────────────────────────────────────────────────────────────────
async function callLLM(messages, modelConfig = {}) {
  const provider = modelConfig.provider || process.env.DEFAULT_PROVIDER || 'glm';

  switch (provider) {
    case 'openai':  return callOpenAI(messages, modelConfig);
    case 'claude':  return callClaude(messages, modelConfig);
    case 'gemini':  return callGemini(messages, modelConfig);
    case 'ollama':  return callOllama(messages, modelConfig);
    case 'glm':
    default:        return callGLM(messages, modelConfig);
  }
}

module.exports = { callLLM };
