const { execFile } = require('child_process');
const { promisify } = require('util');
const { getWorkspaceRoot, safePath } = require('./file.tool');

const execFileAsync = promisify(execFile);
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_OUTPUT_CHARS = 12000;

async function runRg(args, workspaceRoot) {
  const root = getWorkspaceRoot(workspaceRoot);

  try {
    const { stdout } = await execFileAsync('rg', args, {
      cwd: root,
      timeout: DEFAULT_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
    });
    return stdout;
  } catch (error) {
    if (error.code === 1) return '';
    throw new Error(`rg failed: ${error.message}`);
  }
}

async function listFiles(dirPath = '.', workspaceRoot) {
  const { relative } = safePath(workspaceRoot, dirPath);
  const stdout = await runRg(
    [
      '--files',
      '--hidden',
      '--glob', '!.git',
      '--glob', '!node_modules',
      relative === '.' ? '.' : relative,
    ],
    workspaceRoot
  );

  const files = stdout
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 200);

  return JSON.stringify({ count: files.length, files }, null, 2);
}

async function searchFiles(query, workspaceRoot) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    throw new Error('search_files requires a query with at least 2 characters');
  }

  const stdout = await runRg(
    [
      '-n',
      '--hidden',
      '--glob', '!.git',
      '--glob', '!node_modules',
      '--max-count', '200',
      query.trim(),
      '.',
    ],
    workspaceRoot
  );

  return stdout.slice(0, DEFAULT_MAX_OUTPUT_CHARS);
}

module.exports = { listFiles, searchFiles };
