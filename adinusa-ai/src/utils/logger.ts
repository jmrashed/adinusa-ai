import * as vscode from 'vscode';

const channel = vscode.window.createOutputChannel('Adinusa AI');

export const logger = {
  info: (msg: string) => channel.appendLine(`[INFO] ${msg}`),
  error: (msg: string) => channel.appendLine(`[ERROR] ${msg}`),
};
