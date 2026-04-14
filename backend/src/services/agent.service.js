const { callGLM } = require('./llm.service');
const { AGENT_SYSTEM_PROMPT } = require('../prompts/system.prompt');
const { writeFile, readFile } = require('../tools/file.tool');
const { runCommand } = require('../tools/terminal.tool');
const logger = require('../utils/logger');

const MAX_ITERATIONS = Math.min(parseInt(process.env.MAX_AGENT_ITERATIONS ?? '5'), 10);

function buildUserMessage(message, context) {
  let content = message;
  if (context?.fileName) content += `\n\nFile: ${context.fileName}`;
  if (context?.selection) {
    content += `\n\nSelected code:\n\`\`\`\n${context.selection.slice(0, 2000)}\n\`\`\``;
  } else if (context?.file) {
    content += `\n\nFile content:\n\`\`\`\n${context.file.slice(0, 4000)}\n\`\`\``;
  }
  return content;
}

function parseAgentResponse(raw) {
  try {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
    return {
      thought: parsed.thought ?? '',
      plan: Array.isArray(parsed.plan) ? parsed.plan : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      final_answer: parsed.final_answer ?? '',
    };
  } catch {
    return { thought: '', plan: [], actions: [], final_answer: raw };
  }
}

async function executeTool(action) {
  switch (action.tool) {
    case 'write_file':
      if (!action.path || !action.content) throw new Error('write_file requires path and content');
      return writeFile(action.path, action.content);
    case 'read_file':
      if (!action.path) throw new Error('read_file requires path');
      return readFile(action.path);
    case 'run_command':
      if (!action.command) throw new Error('run_command requires command');
      return runCommand(action.command);
    default:
      throw new Error(`Unknown tool: ${action.tool}`);
  }
}

async function runAgent(message, context) {
  const messages = [
    { role: 'system', content: AGENT_SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage(message, context) },
  ];

  let lastParsed = { thought: '', plan: [], actions: [], final_answer: '' };

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const raw = await callGLM(messages);
    const parsed = parseAgentResponse(raw);
    lastParsed = parsed;

    logger.info(`[Agent] Iteration ${i + 1} | thought: ${parsed.thought?.slice(0, 80)}`);

    if (!parsed.actions || parsed.actions.length === 0) break;

    const toolResults = [];
    for (const action of parsed.actions) {
      try {
        const result = await executeTool(action);
        toolResults.push({ tool: action.tool, result: String(result).slice(0, 500) });
        logger.info(`[Tool] ${action.tool} OK`);
      } catch (err) {
        toolResults.push({ tool: action.tool, error: err.message });
        logger.error(`[Tool] ${action.tool} FAILED: ${err.message}`);
      }
    }

    messages.push({ role: 'assistant', content: raw });
    messages.push({
      role: 'user',
      content: `Tool results:\n${JSON.stringify(toolResults, null, 2)}\n\nContinue if needed, or provide final_answer.`,
    });

    if (parsed.final_answer) break;
  }

  return {
    reply: lastParsed.final_answer || 'Task completed.',
    actions: lastParsed.actions ?? [],
  };
}

module.exports = { runAgent };
