const fs = require('fs').promises;
const path = require('path');

const ALLOWED_BASE = process.cwd();

function safePath(filePath) {
  const resolved = path.resolve(ALLOWED_BASE, filePath);
  if (!resolved.startsWith(ALLOWED_BASE)) throw new Error('Path traversal denied');
  return resolved;
}

async function writeFile(filePath, content) {
  const safe = safePath(filePath);
  await fs.mkdir(path.dirname(safe), { recursive: true });
  await fs.writeFile(safe, content, 'utf8');
  return `File written: ${filePath}`;
}

async function readFile(filePath) {
  const safe = safePath(filePath);
  return fs.readFile(safe, 'utf8');
}

module.exports = { writeFile, readFile };
