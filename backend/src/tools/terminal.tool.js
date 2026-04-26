const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const execAsync = promisify(exec);

const BLOCKED = [
  'rm -rf',
  'mkfs',
  'dd if=',
  'shutdown',
  'reboot',
  'format',
  'sudo ',
  'chmod 777',
  'chown ',
  ':(){',
];

function getCommandCwd(workspaceRoot) {
  if (!workspaceRoot || typeof workspaceRoot !== 'string') {
    throw new Error('workspaceRoot is required for command execution');
  }
  return path.resolve(workspaceRoot);
}

async function runCommand(command, workspaceRoot) {
  if (!command || typeof command !== 'string') {
    throw new Error('run_command requires a command string');
  }
  if (command.length > 500) {
    throw new Error('Command too long');
  }
  if (command.includes('\n')) {
    throw new Error('Multiline commands are not allowed');
  }
  if (BLOCKED.some(b => command.includes(b))) {
    throw new Error(`Blocked command: ${command}`);
  }

  const { stdout, stderr } = await execAsync(command, {
    timeout: 30000,
    cwd: getCommandCwd(workspaceRoot),
  });

  return (stdout || stderr || '').slice(0, 12000);
}

module.exports = { runCommand };
