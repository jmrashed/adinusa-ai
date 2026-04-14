import * as vscode from 'vscode';

export async function insertOrReplaceCode(code: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  await editor.edit(eb => {
    if (!editor.selection.isEmpty) {
      eb.replace(editor.selection, code);
    } else {
      eb.insert(editor.selection.active, code);
    }
  });
}
