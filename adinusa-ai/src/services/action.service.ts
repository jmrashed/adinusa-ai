import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import type { AgentAction } from './api.service';

function resolveWorkspacePath(workspaceRoot: string, filePath: string): string {
  const target = path.resolve(workspaceRoot, filePath);
  const relative = path.relative(workspaceRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path is outside the workspace: ${filePath}`);
  }
  return target;
}

export async function applyActions(actions: AgentAction[]) {
  if (!actions || actions.length === 0) return [];

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('Open a workspace folder before applying agent actions.');
  }

  const results: Array<{ id: string; tool: string; status: 'applied' | 'failed'; detail: string }> = [];

  for (const action of actions) {
    try {
      if (action.tool === 'write_file' && action.path && typeof action.content === 'string') {
        const filePath = resolveWorkspacePath(workspaceRoot, action.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, action.content, 'utf8');

        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, { preview: false });

        results.push({
          id: action.id,
          tool: action.tool,
          status: 'applied',
          detail: `Wrote ${action.path}`,
        });
        continue;
      }

      if (action.tool === 'run_command' && action.command) {
        const terminal = vscode.window.createTerminal({
          name: 'Adinusa AI',
          cwd: workspaceRoot,
        });
        terminal.show();
        terminal.sendText(action.command);

        results.push({
          id: action.id,
          tool: action.tool,
          status: 'applied',
          detail: `Started command: ${action.command}`,
        });
        continue;
      }

      throw new Error(`Unsupported action payload for ${action.tool}`);
    } catch (e: any) {
      const detail = e.message ?? String(e);
      results.push({
        id: action.id,
        tool: action.tool,
        status: 'failed',
        detail,
      });
      vscode.window.showErrorMessage(`Action failed (${action.tool}): ${detail}`);
    }
  }

  return results;
}
