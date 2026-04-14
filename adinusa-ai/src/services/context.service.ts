import * as vscode from 'vscode';

export function getEditorContext() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return {};
  return {
    fileName: editor.document.fileName,
    file: editor.document.getText(),
    selection: editor.document.getText(editor.selection) || undefined,
  };
}
