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

async function deleteFile(filePath, workspaceRoot) {
  const { target, relative } = safePath(workspaceRoot, filePath);

  try {
    await fs.access(target);
  } catch {
    throw new Error(`File does not exist: ${relative}`);
  }

  await fs.unlink(target);
  return `File deleted: ${relative}`;
}

module.exports = { deleteFile };
