const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const BLOCKED = ['rm -rf', 'mkfs', 'dd if=', 'shutdown', 'reboot', 'format'];

async function runCommand(command) {
  if (BLOCKED.some(b => command.includes(b))) {
    throw new Error(`Blocked command: ${command}`);
  }
  const { stdout, stderr } = await execAsync(command, { timeout: 30000, cwd: process.cwd() });
  return stdout || stderr;
}

module.exports = { runCommand };
