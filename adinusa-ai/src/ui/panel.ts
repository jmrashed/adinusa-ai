import * as vscode from 'vscode';
import { sendChat } from '../services/api.service';
import { getEditorContext } from '../services/context.service';
import { applyActions } from '../services/action.service';
import { logger } from '../utils/logger';

export class ChatPanel {
  static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  static createOrShow(extensionUri: vscode.Uri) {
    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'adinusaChat', 'Adinusa AI',
      vscode.ViewColumn.Beside,
      { enableScripts: true, localResourceRoots: [extensionUri] }
    );
    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._panel.webview.html = this._getHtml();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type !== 'chat') return;
      try {
        const res = await sendChat({ message: msg.text, intent: 'chat', context: getEditorContext('chat') });
        this._panel.webview.postMessage({ type: 'reply', text: res.reply, actions: res.actions });
        if (res.actions && res.actions.length > 0) {
          const apply = await vscode.window.showInformationMessage(
            `Adinusa AI wants to execute ${res.actions.length} action(s). Apply?`,
            'Apply', 'Skip'
          );
          if (apply === 'Apply') {
            await applyActions(res.actions, { extensionUri: this._extensionUri } as any);
          }
        }
      } catch (e: any) {
        logger.error(e.message);
        this._panel.webview.postMessage({ type: 'error', text: e.message });
      }
    }, null, this._disposables);
  }

  dispose() {
    ChatPanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach(d => d.dispose());
  }

  private _getHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Adinusa AI</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--vscode-font-family);background:var(--vscode-editor-background);color:var(--vscode-editor-foreground);display:flex;flex-direction:column;height:100vh;font-size:13px}
  #messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:12px}
  .msg{padding:10px 14px;border-radius:8px;max-width:90%;line-height:1.6;word-break:break-word}
  .user{background:var(--vscode-button-background);color:var(--vscode-button-foreground);align-self:flex-end;white-space:pre-wrap}
  .ai{background:var(--vscode-editorWidget-background);border:1px solid var(--vscode-editorWidget-border,#444);align-self:flex-start;width:100%}
  .error{background:var(--vscode-inputValidation-errorBackground,#5a1d1d);color:var(--vscode-errorForeground,#f48771);align-self:flex-start;width:100%}
  .thinking{opacity:0.55;font-style:italic;align-self:flex-start}
  /* Markdown styles */
  .ai pre{background:var(--vscode-textCodeBlock-background,#1e1e1e);border:1px solid var(--vscode-editorWidget-border,#444);border-radius:4px;padding:10px;overflow-x:auto;margin:8px 0}
  .ai code{font-family:var(--vscode-editor-font-family,monospace);font-size:12px}
  .ai p{margin:4px 0}
  .ai ul,.ai ol{padding-left:20px;margin:4px 0}
  .ai h1,.ai h2,.ai h3{margin:8px 0 4px;font-weight:600}
  .ai strong{font-weight:600}
  .ai em{font-style:italic}
  .ai blockquote{border-left:3px solid var(--vscode-textBlockQuote-border,#555);padding-left:10px;opacity:0.8;margin:4px 0}
  .ai a{color:var(--vscode-textLink-foreground,#4daafc)}
  .actions-bar{font-size:11px;opacity:0.6;margin-top:6px;padding-top:6px;border-top:1px solid var(--vscode-editorWidget-border,#444)}
  #input-row{display:flex;gap:8px;padding:10px;border-top:1px solid var(--vscode-editorWidget-border,#444)}
  #input{flex:1;padding:8px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border,#555);border-radius:4px;font-size:13px;resize:none;font-family:inherit;line-height:1.4}
  #input:focus{outline:1px solid var(--vscode-focusBorder,#007fd4)}
  #send{padding:8px 16px;background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:4px;cursor:pointer;font-size:13px;white-space:nowrap}
  #send:hover{background:var(--vscode-button-hoverBackground)}
  #send:disabled{opacity:0.4;cursor:not-allowed}
</style>
</head>
<body>
<div id="messages"></div>
<div id="input-row">
  <textarea id="input" rows="2" placeholder="Ask Adinusa AI... (Enter to send, Shift+Enter for newline)"></textarea>
  <button id="send">Send</button>
</div>
<script>
  const vscode = acquireVsCodeApi();
  const messagesEl = document.getElementById('messages');
  const input = document.getElementById('input');
  const send = document.getElementById('send');
  let thinking = null;

  // Minimal markdown renderer
  function renderMarkdown(text) {
    let html = text
      // Escape HTML first
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      // Code blocks
      .replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (_,lang,code) =>
        '<pre><code class="lang-'+lang+'">'+code.trim()+'</code></pre>')
      // Inline code
      .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Blockquote
      .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
      // Unordered list
      .replace(/^\- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // Line breaks (not inside pre)
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>');
    return '<p>' + html + '</p>';
  }

  function addMsg(text, cls, isMarkdown = false) {
    const d = document.createElement('div');
    d.className = 'msg ' + cls;
    if (isMarkdown) {
      d.innerHTML = renderMarkdown(text);
    } else {
      d.textContent = text;
    }
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return d;
  }

  send.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text || send.disabled) return;
    addMsg(text, 'user');
    input.value = '';
    thinking = addMsg('Thinking...', 'msg thinking');
    send.disabled = true;
    vscode.postMessage({ type: 'chat', text });
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send.click(); }
  });

  window.addEventListener('message', e => {
    if (thinking) { thinking.remove(); thinking = null; }
    send.disabled = false;
    const msg = e.data;
    if (msg.type === 'reply') {
      const d = addMsg(msg.text, 'ai', true);
      if (msg.actions && msg.actions.length > 0) {
        const bar = document.createElement('div');
        bar.className = 'actions-bar';
        bar.textContent = '⚡ ' + msg.actions.length + ' action(s) pending — check VS Code notification to apply.';
        d.appendChild(bar);
      }
    } else if (msg.type === 'error') {
      addMsg('Error: ' + msg.text, 'error');
    }
  });
</script>
</body>
</html>`;
  }
}
