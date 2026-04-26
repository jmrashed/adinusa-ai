import * as vscode from 'vscode';

export function extractCodeFromText(text: string): { code: string; language?: string } | null {
  const fenceMatch = text.match(/```([\w+-]*)\n([\s\S]*?)```/);
  if (!fenceMatch) return null;

  const code = fenceMatch[2].trim();
  if (!code) return null;

  return {
    code,
    language: fenceMatch[1] || undefined,
  };
}

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
