const axios = require('axios');

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function callGLM(messages, options = {}) {
  if (!process.env.ZHIPU_API_KEY) {
    throw new Error('ZHIPU_API_KEY is not set in environment');
  }

  const response = await axios.post(
    GLM_API_URL,
    {
      model: options.model ?? process.env.GLM_MODEL ?? 'glm-4-flash',
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from GLM API');
  return content;
}

module.exports = { callGLM };
