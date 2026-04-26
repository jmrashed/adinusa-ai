import * as vscode from 'vscode';

function getDiagnostics(editor: vscode.TextEditor): string[] {
  const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
  return diagnostics.slice(0, 20).map(diag => {
    const line = diag.range.start.line + 1;
    const column = diag.range.start.character + 1;
    const severityMap: Record<number, string> = {
      [vscode.DiagnosticSeverity.Error]: 'Error',
      [vscode.DiagnosticSeverity.Warning]: 'Warning',
      [vscode.DiagnosticSeverity.Information]: 'Info',
      [vscode.DiagnosticSeverity.Hint]: 'Hint',
    };
    return `${severityMap[diag.severity] ?? 'Info'} at ${line}:${column} - ${diag.message}`;
  });
}

export function getEditorContext(intent?: string) {
  const editor = vscode.window.activeTextEditor;
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!editor) return { intent, workspaceRoot };

  const selection = editor.document.getText(editor.selection) || undefined;
  const fileName = editor.document.fileName;
  const diagnostics = intent === 'fix' ? getDiagnostics(editor) : undefined;

  if ((intent === 'explain' || intent === 'fix') && selection) {
    return { fileName, selection, intent, workspaceRoot, diagnostics };
  }

  return {
    fileName,
    file: editor.document.getText().slice(0, 4000),
    selection,
    intent,
    workspaceRoot,
    diagnostics,
  };
}
