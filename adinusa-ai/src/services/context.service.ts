import * as vscode from 'vscode';

export function getEditorContext(intent?: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return {};

  const selection = editor.document.getText(editor.selection) || undefined;
  const fileName = editor.document.fileName;

  if ((intent === 'explain' || intent === 'fix') && selection) {
    return { fileName, selection, intent };
  }

  return {
    fileName,
    file: editor.document.getText().slice(0, 4000),
    selection,
    intent,
  };
}
