import * as vscode from 'vscode';
import { MANUAL_SECTIONS } from '../content/manual';

export class ManualPanel {
  static currentPanel: ManualPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  static createOrShow() {
    if (ManualPanel.currentPanel) {
      ManualPanel.currentPanel._panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'adinusaManual', 'Adinusa AI — Manual',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );
    ManualPanel.currentPanel = new ManualPanel(panel);
  }

  private constructor(panel: vscode.WebviewPanel) {
    this._panel = panel;
    this._panel.webview.html = this._getHtml();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  dispose() {
    ManualPanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach(d => d.dispose());
  }

  private _getHtml(): string {
    const nav = MANUAL_SECTIONS.map((s, i) =>
      `<a href="#section-${i}">${s.title}</a>`
    ).join('');

    const sections = MANUAL_SECTIONS.map((s, i) => `
      <section id="section-${i}">
        <h2>${s.title}</h2>
        ${s.content}
      </section>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Adinusa AI Manual</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--vscode-font-family);background:var(--vscode-editor-background);color:var(--vscode-editor-foreground);font-size:13px;display:flex;height:100vh;overflow:hidden}
  nav{width:180px;min-width:180px;border-right:1px solid var(--vscode-editorWidget-border,#444);padding:16px 0;overflow-y:auto;display:flex;flex-direction:column;gap:2px}
  nav a{display:block;padding:6px 16px;color:var(--vscode-foreground);text-decoration:none;border-radius:0;font-size:12px;opacity:0.8;cursor:pointer}
  nav a:hover,nav a.active{background:var(--vscode-list-hoverBackground);opacity:1}
  main{flex:1;overflow-y:auto;padding:24px 32px}
  section{display:none;max-width:800px}
  section.active{display:block}
  h1{font-size:18px;font-weight:600;margin-bottom:20px;color:var(--vscode-foreground)}
  h2{font-size:15px;font-weight:600;margin-bottom:14px;color:var(--vscode-foreground)}
  p{margin-bottom:10px;line-height:1.6;opacity:0.9}
  ol,ul{padding-left:20px;margin-bottom:10px;line-height:1.8}
  pre{background:var(--vscode-textCodeBlock-background,#1e1e1e);border:1px solid var(--vscode-editorWidget-border,#444);border-radius:4px;padding:10px 14px;margin:10px 0;font-family:var(--vscode-editor-font-family,monospace);font-size:12px;overflow-x:auto}
  code{font-family:var(--vscode-editor-font-family,monospace);font-size:12px;background:var(--vscode-textCodeBlock-background,#1e1e1e);padding:1px 5px;border-radius:3px}
  pre code{background:none;padding:0}
  kbd{background:var(--vscode-editorWidget-background);border:1px solid var(--vscode-editorWidget-border,#555);border-radius:3px;padding:1px 6px;font-size:11px;font-family:var(--vscode-editor-font-family,monospace)}
  table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px}
  th{text-align:left;padding:7px 10px;background:var(--vscode-editorWidget-background);border-bottom:2px solid var(--vscode-editorWidget-border,#444);font-weight:600}
  td{padding:7px 10px;border-bottom:1px solid var(--vscode-editorWidget-border,#333);vertical-align:top;line-height:1.5}
  tr:last-child td{border-bottom:none}
  a{color:var(--vscode-textLink-foreground,#4daafc)}
  strong{font-weight:600}
  em{font-style:italic;opacity:0.85}
  .header{display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--vscode-editorWidget-border,#444)}
  .header .logo{font-size:22px}
  .header h1{margin:0}
</style>
</head>
<body>
<nav>
  ${nav}
</nav>
<main>
  <div class="header">
    <span class="logo">🤖</span>
    <h1>Adinusa AI — User Manual</h1>
  </div>
  ${sections}
</main>
<script>
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('section');

  function showSection(index) {
    sections.forEach((s, i) => s.classList.toggle('active', i === index));
    navLinks.forEach((a, i) => a.classList.toggle('active', i === index));
  }

  navLinks.forEach((link, i) => {
    link.addEventListener('click', e => { e.preventDefault(); showSection(i); });
  });

  showSection(0);
</script>
</body>
</html>`;
  }
}
