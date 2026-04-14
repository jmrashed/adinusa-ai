import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface AgentAction {
  tool: string;
  path?: string;
  content?: string;
  command?: string;
}

export async function applyActions(actions: AgentAction[], context: vscode.ExtensionContext) {
  if (!actions || actions.length === 0) return;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  for (const action of actions) {
    try {
      if (action.tool === 'write_file' && action.path && action.content) {
        const filePath = workspaceRoot
          ? path.resolve(workspaceRoot, action.path)
          : path.resolve(action.path);

        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, action.content, 'utf8');

        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc, { preview: false });
        vscode.window.showInformationMessage(`Adinusa AI: Created ${action.path}`);

      } else if (action.tool === 'run_command' && action.command) {
        const terminal = vscode.window.createTerminal('Adinusa AI');
        terminal.show();
        terminal.sendText(action.command);
      }
    } catch (e: any) {
      vscode.window.showErrorMessage(`Action failed (${action.tool}): ${e.message}`);
    }
  }
}
