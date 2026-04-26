const { callLLM } = require('./llm.service');
const { AGENT_SYSTEM_PROMPT } = require('../prompts/system.prompt');
const { readFile } = require('../tools/file.tool');
const { listFiles, searchFiles } = require('../tools/search.tool');
const logger = require('../utils/logger');

const MAX_ITERATIONS = Math.min(parseInt(process.env.MAX_AGENT_ITERATIONS ?? '5'), 10);

const NO_ACTION_INTENTS = ['explain', 'answer'];
const SERVER_SIDE_TOOLS = new Set(['read_file', 'list_files', 'search_files']);
const APPROVAL_REQUIRED_TOOLS = new Set(['write_file', 'run_command']);

function buildUserMessage(message, context, intent) {
  let content = intent ? `[Intent: ${intent}]\n${message}` : message;
  if (context?.workspaceRoot) content += `\n\nWorkspace root: ${context.workspaceRoot}`;
  if (context?.fileName) content += `\n\nFile: ${context.fileName}`;
  if (context?.selection) {
    content += `\n\nSelected code:\n\`\`\`\n${context.selection.slice(0, 2000)}\n\`\`\``;
  } else if (context?.file) {
    content += `\n\nFile content:\n\`\`\`\n${context.file.slice(0, 4000)}\n\`\`\``;
  }
  if (Array.isArray(context?.diagnostics) && context.diagnostics.length > 0) {
    const diagnostics = context.diagnostics
      .slice(0, 20)
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');
    content += `\n\nDiagnostics:\n${diagnostics}`;
  }
  return content;
}

function parseAgentResponse(raw) {
  try {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1] : raw);
    return {
      thought: parsed.thought ?? '',
      intent: parsed.intent ?? '',
      plan: Array.isArray(parsed.plan) ? parsed.plan : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      final_answer: parsed.final_answer ?? '',
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
      language: typeof parsed.language === 'string' ? parsed.language : undefined,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    };
  } catch {
    logger.warn(`[Agent] JSON parse failed, raw length: ${raw.length}`);
    return { thought: '', intent: '', plan: [], actions: [], final_answer: raw, warnings: [] };
  }
}

function extractCodeBlock(text = '') {
  const match = text.match(/```([\w+-]*)\n([\s\S]*?)```/);
  if (!match) return {};
  return {
    language: match[1] || undefined,
    code: match[2].trim(),
  };
}

function normalizeAction(action, index) {
  if (action.tool === 'write_file') {
    return {
      id: `action-${index + 1}`,
      tool: action.tool,
      path: action.path,
      content: typeof action.content === 'string' ? action.content : '',
      title: action.path ? `Write ${action.path}` : 'Write file',
      risk: 'medium',
      preview: action.path ? `Create or overwrite ${action.path}` : 'Create or overwrite a file',
    };
  }

  if (action.tool === 'run_command') {
    return {
      id: `action-${index + 1}`,
      tool: action.tool,
      command: action.command,
      title: action.command ? `Run: ${action.command}` : 'Run command',
      risk: 'high',
      preview: action.command ?? 'Execute terminal command',
    };
  }

  return { id: `action-${index + 1}`, ...action };
}

async function executeServerTool(action, workspaceRoot) {
  switch (action.tool) {
    case 'read_file':
      if (!action.path) throw new Error('read_file requires path');
      return readFile(action.path, workspaceRoot);
    case 'list_files':
      return listFiles(action.path || '.', workspaceRoot);
    case 'search_files':
      return searchFiles(action.query || action.pattern || action.term, workspaceRoot);
    default:
      throw new Error(`Unknown tool: ${action.tool}`);
  }
}

async function runAgent(message, context, modelConfig = {}) {
  if (!context?.workspaceRoot) {
    throw new Error('A workspace folder must be open before Adinusa AI can inspect or modify files.');
  }

  const intent = context?.intent;
  const messages = [
    { role: 'system', content: AGENT_SYSTEM_PROMPT },
    { role: 'user', content: buildUserMessage(message, context, intent) },
  ];

  let lastParsed = { thought: '', intent: '', plan: [], actions: [], final_answer: '', warnings: [] };
  let pendingActions = [];
  let iterationCount = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterationCount = i + 1;
    const raw = await callLLM(messages, modelConfig);
    const parsed = parseAgentResponse(raw);
    lastParsed = parsed;

    logger.info(`[Agent:${modelConfig.provider || 'glm'}] Iteration ${i + 1} | intent: ${parsed.intent} | thought: ${parsed.thought?.slice(0, 80)}`);

    if (NO_ACTION_INTENTS.includes(intent) || NO_ACTION_INTENTS.includes(parsed.intent)) {
      const extracted = extractCodeBlock(parsed.final_answer || raw);
      return {
        reply: parsed.final_answer || raw,
        actions: [],
        code: parsed.code ?? extracted.code,
        language: parsed.language ?? extracted.language,
        warnings: parsed.warnings ?? [],
        meta: { intent: parsed.intent || intent || 'answer', iterations: iterationCount },
      };
    }

    const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
    const serverActions = actions.filter(action => SERVER_SIDE_TOOLS.has(action.tool));
    pendingActions = actions
      .filter(action => APPROVAL_REQUIRED_TOOLS.has(action.tool))
      .map((action, index) => normalizeAction(action, index));

    if (pendingActions.length > 0) {
      if (parsed.final_answer) break;

      messages.push({ role: 'assistant', content: raw });
      messages.push({
        role: 'user',
        content: 'Do not execute write_file or run_command. Summarize the pending actions for the user in final_answer and stop.',
      });
      continue;
    }

    if (serverActions.length === 0) break;

    const toolResults = [];
    for (const action of serverActions) {
      try {
        const result = await executeServerTool(action, context.workspaceRoot);
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

  const extracted = extractCodeBlock(lastParsed.final_answer || '');
  return {
    reply: lastParsed.final_answer || 'Task completed.',
    actions: pendingActions,
    code: lastParsed.code ?? extracted.code,
    language: lastParsed.language ?? extracted.language,
    warnings: lastParsed.warnings ?? [],
    meta: { intent: lastParsed.intent || intent || 'chat', iterations: iterationCount },
  };
}

module.exports = { runAgent };
