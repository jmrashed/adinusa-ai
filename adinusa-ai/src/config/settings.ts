import * as vscode from 'vscode';

export function getBackendUrl(): string {
  return vscode.workspace.getConfiguration('adinusaAi').get<string>('backendUrl') ?? 'http://localhost:3002';
}
