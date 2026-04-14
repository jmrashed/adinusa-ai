import * as vscode from 'vscode';
import { sendChat } from '../services/api.service';
import { getEditorContext } from '../services/context.service';
import { insertOrReplaceCode } from '../services/editor.service';
import { logger } from '../utils/logger';

async function withErrorHandling(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e: any) {
    logger.error(e.message);
    vscode.window.showErrorMessage(`Adinusa AI: ${e.message}`);
  }
}

export function registerAskCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.ask', () =>
    withErrorHandling(async () => {
      const message = await vscode.window.showInputBox({ prompt: 'Ask Adinusa AI...' });
      if (!message) return;
      const res = await sendChat({ message, intent: 'chat', context: getEditorContext('chat') });
      vscode.window.showInformationMessage(res.reply.slice(0, 250));
    })
  );
}

export function registerGenerateCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.generate', () =>
    withErrorHandling(async () => {
      const message = await vscode.window.showInputBox({ prompt: 'Describe code to generate...' });
      if (!message) return;
      const res = await sendChat({ message: `Generate code: ${message}`, intent: 'generate', context: getEditorContext('generate') });
      await insertOrReplaceCode(res.reply);
    })
  );
}

export function registerExplainCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.explain', () =>
    withErrorHandling(async () => {
      const ctx = getEditorContext('explain');
      if (!ctx.selection) { vscode.window.showWarningMessage('Select code to explain first.'); return; }
      const res = await sendChat({ message: 'Explain this code', intent: 'explain', context: ctx });
      vscode.window.showInformationMessage(res.reply.slice(0, 300));
    })
  );
}

export function registerFixCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.fix', () =>
    withErrorHandling(async () => {
      const ctx = getEditorContext('fix');
      if (!ctx.selection) { vscode.window.showWarningMessage('Select code to fix first.'); return; }
      const res = await sendChat({ message: 'Fix this code', intent: 'fix', context: ctx });
      await insertOrReplaceCode(res.reply);
    })
  );
}
