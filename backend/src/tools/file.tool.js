const fs = require('fs').promises;
const path = require('path');

function getWorkspaceRoot(workspaceRoot) {
  if (!workspaceRoot || typeof workspaceRoot !== 'string') {
    throw new Error('workspaceRoot is required for file operations');
  }
  return path.resolve(workspaceRoot);
}

function safePath(workspaceRoot, filePath = '.') {
  const root = getWorkspaceRoot(workspaceRoot);
  const target = path.resolve(root, filePath);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path traversal denied: ${filePath}`);
  }

  return { root, target, relative: relative || '.' };
}

async function writeFile(filePath, content, workspaceRoot) {
  if (typeof content !== 'string') {
    throw new Error('write_file requires string content');
  }

  const { target, relative } = safePath(workspaceRoot, filePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, 'utf8');
  return `File written: ${relative}`;
}

async function readFile(filePath, workspaceRoot) {
  const { target } = safePath(workspaceRoot, filePath);
  return fs.readFile(target, 'utf8');
}

module.exports = { getWorkspaceRoot, safePath, writeFile, readFile };
