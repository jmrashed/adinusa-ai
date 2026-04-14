import * as vscode from 'vscode';
import { ChatPanel } from './ui/panel';
import { registerAskCommand, registerExplainCommand, registerFixCommand, registerGenerateCommand } from './commands/index';

export function activate(context: vscode.ExtensionContext) {
  // Status bar item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = '$(robot) Adinusa AI';
  statusBar.tooltip = 'Open Adinusa AI Chat (Ctrl+Shift+A)';
  statusBar.command = 'adinusa-ai.openChat';
  statusBar.show();

  context.subscriptions.push(
    statusBar,
    vscode.commands.registerCommand('adinusa-ai.openChat', () => ChatPanel.createOrShow(context.extensionUri)),
    registerAskCommand(context),
    registerGenerateCommand(context),
    registerExplainCommand(context),
    registerFixCommand(context),
  );
}

export function deactivate() {}
