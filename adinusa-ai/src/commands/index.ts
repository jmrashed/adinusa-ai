import * as vscode from 'vscode';
import { sendChat } from '../services/api.service';
import { getEditorContext } from '../services/context.service';
import { extractCodeFromText, insertOrReplaceCode } from '../services/editor.service';
import { logger } from '../utils/logger';

async function withErrorHandling(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    logger.error(message);
    void vscode.window.showErrorMessage(`Adinusa AI: ${message}`);
  }
}

function resolveCodeReply(reply: Awaited<ReturnType<typeof sendChat>>): string {
  if (reply.code && reply.code.trim()) return reply.code;
  const extracted = extractCodeFromText(reply.reply);
  if (extracted?.code) return extracted.code;
  return reply.reply;
}

export function registerAskCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.ask', () =>
    withErrorHandling(async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        void vscode.window.showErrorMessage('Adinusa AI: Please open a workspace folder first.');
        return;
      }
      const message = await vscode.window.showInputBox({ prompt: 'Ask Adinusa AI...' });
      if (!message) return;
      const res = await sendChat({ message, intent: 'chat', context: getEditorContext('chat') });
      void vscode.window.showInformationMessage(res.reply.slice(0, 250));
    })
  );
}

export function registerGenerateCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.generate', () =>
    withErrorHandling(async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        void vscode.window.showErrorMessage('Adinusa AI: Please open a workspace folder first.');
        return;
      }
      const message = await vscode.window.showInputBox({ prompt: 'Describe code to generate...' });
      if (!message) return;
      const res = await sendChat({ message: `Generate code: ${message}`, intent: 'generate', context: getEditorContext('generate') });
      await insertOrReplaceCode(resolveCodeReply(res));
    })
  );
}

export function registerExplainCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.explain', () =>
    withErrorHandling(async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        void vscode.window.showErrorMessage('Adinusa AI: Please open a workspace folder first.');
        return;
      }
      const ctx = getEditorContext('explain');
      if (!ctx.selection) { void vscode.window.showWarningMessage('Select code to explain first.'); return; }
      const res = await sendChat({ message: 'Explain this code', intent: 'explain', context: ctx });
      void vscode.window.showInformationMessage(res.reply.slice(0, 300));
    })
  );
}

export function registerFixCommand(_ctx: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('adinusa-ai.fix', () =>
    withErrorHandling(async () => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        void vscode.window.showErrorMessage('Adinusa AI: Please open a workspace folder first.');
        return;
      }
      const ctx = getEditorContext('fix');
      if (!ctx.selection) { void vscode.window.showWarningMessage('Select code to fix first.'); return; }
      const res = await sendChat({ message: 'Fix this code', intent: 'fix', context: ctx });
      await insertOrReplaceCode(resolveCodeReply(res));
    })
  );
}
