import * as vscode from 'vscode';
import { sendChat } from '../services/api.service';
import { getEditorContext } from '../services/context.service';
import { applyActions } from '../services/action.service';
import { getBackendUrl } from '../config/settings';
import { logger } from '../utils/logger';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  static readonly viewId = 'adinusa-ai.chatView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
    webviewView.webview.html = this._getHtml();

    webviewView.webview.onDidReceiveMessage(async (event) => {
      if (event.type === 'healthCheck') {
        try {
          const res = await fetch(`${getBackendUrl()}/health`);
          webviewView.webview.postMessage({ type: 'status', ok: res.ok, url: getBackendUrl() });
        } catch {
          webviewView.webview.postMessage({ type: 'status', ok: false });
        }
        return;
      }

      if (event.type === 'actionConfirm') {
        try {
          const results = await applyActions(event.actions);
          webviewView.webview.postMessage({ type: 'actionDone', msgId: event.msgId, results });
        } catch (e: any) {
          webviewView.webview.postMessage({ type: 'actionError', msgId: event.msgId, text: e.message });
        }
        return;
      }

      if (event.type !== 'chat') return;

      try {
        const intent = event.intent ?? 'chat';
        const res = await sendChat({ message: event.text, intent, context: getEditorContext(intent) });
        webviewView.webview.postMessage({ type: 'reply', text: res.reply, actions: res.actions ?? [] });
      } catch (e: any) {
        logger.error(e.message);
        webviewView.webview.postMessage({ type: 'error', text: e.message });
      }
    });
  }

  focus() {
    if (this._view) {
      this._view.show(true);
    } else {
      vscode.commands.executeCommand('adinusa-ai.chatView.focus');
    }
  }

  notifyFileContext(fileName: string | undefined) {
    this._view?.webview.postMessage({ type: 'fileContext', fileName: fileName ?? '' });
  }

  private _getHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
<title>Adinusa AI</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--vscode-font-family);background:var(--vscode-sideBar-background);color:var(--vscode-sideBar-foreground,var(--vscode-editor-foreground));display:flex;flex-direction:column;height:100vh;font-size:13px}
#status-banner{display:none;background:var(--vscode-inputValidation-warningBackground,#352a05);color:var(--vscode-inputValidation-warningForeground,#cca700);font-size:11px;padding:5px 10px;border-bottom:1px solid var(--vscode-inputValidation-warningBorder,#cca700);display:none;align-items:center;gap:6px}
#status-banner button{margin-left:auto;padding:2px 8px;font-size:10px;background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:3px;cursor:pointer}
#toolbar{display:flex;align-items:center;gap:6px;padding:5px 8px;border-bottom:1px solid var(--vscode-editorWidget-border,#444);font-size:11px;flex-shrink:0}
#file-ctx{flex:1;opacity:0.55;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#clear-btn{padding:2px 8px;font-size:10px;background:transparent;color:var(--vscode-foreground);border:1px solid var(--vscode-editorWidget-border,#555);border-radius:3px;cursor:pointer;opacity:0.7}
#clear-btn:hover{opacity:1}
#messages{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:10px}
.msg{padding:8px 12px;border-radius:6px;line-height:1.6;word-break:break-word;font-size:12px}
.user{background:var(--vscode-button-background);color:var(--vscode-button-foreground);align-self:flex-end;max-width:85%;white-space:pre-wrap}
.ai{background:var(--vscode-editorWidget-background);border:1px solid var(--vscode-editorWidget-border,#444);align-self:flex-start;width:100%}
.error{background:var(--vscode-inputValidation-errorBackground,#5a1d1d);color:var(--vscode-errorForeground,#f48771);width:100%}
.ts{font-size:9px;opacity:0.45;margin-top:4px;display:block}
.user .ts{text-align:right}
.thinking{display:flex;gap:4px;align-items:center;padding:10px 12px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--vscode-foreground);opacity:0.4;animation:bounce 1.2s infinite ease-in-out}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}
.ai pre{position:relative;background:var(--vscode-textCodeBlock-background,#1e1e1e);border:1px solid var(--vscode-editorWidget-border,#444);border-radius:3px;padding:8px;overflow-x:auto;margin:6px 0;font-size:11px}
.copy-btn{position:absolute;top:4px;right:4px;padding:2px 6px;font-size:10px;background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:3px;cursor:pointer;opacity:0.7}
.copy-btn:hover{opacity:1}
.ai code{font-family:var(--vscode-editor-font-family,monospace);font-size:11px}
.ai p{margin:3px 0}.ai ul,.ai ol{padding-left:16px;margin:3px 0}
.ai h1,.ai h2,.ai h3{margin:6px 0 3px;font-weight:600;font-size:12px}
.ai strong{font-weight:600}.ai em{font-style:italic}
.ai blockquote{border-left:2px solid var(--vscode-textBlockQuote-border,#555);padding-left:8px;opacity:.8;margin:3px 0}
.ai a{color:var(--vscode-textLink-foreground,#4daafc)}
.action-card{margin-top:8px;padding:8px;background:var(--vscode-editorWidget-background);border:1px solid var(--vscode-inputValidation-warningBorder,#cca700);border-radius:4px;font-size:11px}
.action-card p{margin-bottom:6px;opacity:.85}
.action-list{display:flex;flex-direction:column;gap:6px;margin:8px 0}
.action-item{padding:6px;border-radius:4px;background:var(--vscode-sideBar-background);border:1px solid var(--vscode-editorWidget-border,#444)}
.action-meta{display:flex;justify-content:space-between;gap:8px;font-size:10px;opacity:.7;margin-top:4px}
.action-card .act-btns{display:flex;gap:6px}
.act-btn{padding:3px 10px;font-size:11px;border:none;border-radius:3px;cursor:pointer}
.act-apply{background:var(--vscode-button-background);color:var(--vscode-button-foreground)}
.act-skip{background:transparent;color:var(--vscode-foreground);border:1px solid var(--vscode-editorWidget-border,#555)}
.act-btn:disabled{opacity:.4;cursor:not-allowed}
#input-row{display:flex;flex-direction:column;gap:5px;padding:8px;border-top:1px solid var(--vscode-editorWidget-border,#444);flex-shrink:0}
#intent-row{display:flex;gap:4px}
.intent-btn{flex:1;padding:3px 0;font-size:10px;background:transparent;color:var(--vscode-foreground);border:1px solid var(--vscode-editorWidget-border,#555);border-radius:3px;cursor:pointer;opacity:.65}
.intent-btn.active{background:var(--vscode-button-background);color:var(--vscode-button-foreground);opacity:1;border-color:transparent}
#input{width:100%;padding:7px 8px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border,#555);border-radius:4px;font-size:12px;resize:none;font-family:inherit;line-height:1.4;min-height:38px}
#input:focus{outline:1px solid var(--vscode-focusBorder,#007fd4);border-color:var(--vscode-focusBorder,#007fd4)}
#send{padding:6px 12px;background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:4px;cursor:pointer;font-size:12px;align-self:flex-end}
#send:hover{background:var(--vscode-button-hoverBackground)}
#send:disabled{opacity:.4;cursor:not-allowed}
.welcome{text-align:center;opacity:.5;font-size:11px;margin-top:20px;line-height:1.8}
.welcome .logo{font-size:28px;display:block;margin-bottom:8px}
</style>
</head>
<body>
<div id="status-banner">
  <span id="status-text"></span>
  <button id="retry-btn">Retry</button>
</div>
<div id="toolbar">
  <span id="file-ctx">No file open</span>
  <button id="clear-btn" title="Clear chat">Clear</button>
</div>
<div id="messages">
  <div class="welcome">
    <span class="logo">🤖</span>
    <strong>Adinusa AI</strong><br>
    Ask anything, generate, explain,<br>or fix your code.
  </div>
</div>
<div id="input-row">
  <div id="intent-row">
    <button class="intent-btn active" data-intent="chat">Chat</button>
    <button class="intent-btn" data-intent="generate">Generate</button>
    <button class="intent-btn" data-intent="explain">Explain</button>
    <button class="intent-btn" data-intent="fix">Fix</button>
  </div>
  <textarea id="input" rows="2" placeholder="Ask Adinusa AI… (Enter to send, Shift+Enter for newline)"></textarea>
  <button id="send">Send</button>
</div>
<script>
const vscode = acquireVsCodeApi();
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const statusBanner = document.getElementById('status-banner');
const statusText = document.getElementById('status-text');
const retryBtn = document.getElementById('retry-btn');
const fileCtx = document.getElementById('file-ctx');
let thinkingEl = null;
let activeIntent = 'chat';
let msgCounter = 0;

// Intent selector
document.getElementById('intent-row').addEventListener('click', e => {
  const btn = e.target.closest('.intent-btn');
  if (!btn) return;
  document.querySelectorAll('.intent-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeIntent = btn.dataset.intent;
  inputEl.placeholder = {
    chat: 'Ask Adinusa AI… (Enter to send, Shift+Enter for newline)',
    generate: 'Describe code to generate…',
    explain: 'Paste or select code to explain…',
    fix: 'Describe the bug or paste broken code…'
  }[activeIntent];
});

// Clear chat
document.getElementById('clear-btn').addEventListener('click', () => {
  messagesEl.innerHTML = '<div class="welcome"><span class="logo">🤖</span><strong>Adinusa AI</strong><br>Ask anything, generate, explain,<br>or fix your code.</div>';
});

// Health check
function doHealthCheck() {
  vscode.postMessage({ type: 'healthCheck' });
}
retryBtn.addEventListener('click', doHealthCheck);

function ts() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderMarkdown(raw) {
  const escaped = raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (_, lang, code) =>
      '<pre><button class="copy-btn" onclick="copyCode(this)">Copy</button><code>' + code.trim() + '</code></pre>')
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function copyCode(btn) {
  const code = btn.nextElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderActions(actions) {
  return actions.map(action => {
    const title = escapeHtml(action.title || action.tool);
    const preview = escapeHtml(action.preview || action.command || action.path || '');
    const risk = escapeHtml(action.risk || 'low');
    return '<div class="action-item">' +
      '<strong>' + title + '</strong>' +
      (preview ? '<div>' + preview + '</div>' : '') +
      '<div class="action-meta"><span>' + escapeHtml(action.tool) + '</span><span>Risk: ' + risk + '</span></div>' +
      '</div>';
  }).join('');
}

function addMsg(html, cls, isHtml = false) {
  const welcome = messagesEl.querySelector('.welcome');
  if (welcome) welcome.remove();
  const d = document.createElement('div');
  d.className = 'msg ' + cls;
  d.innerHTML = (isHtml ? html : html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'))
    + '<span class="ts">' + ts() + '</span>';
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return d;
}

function showThinking() {
  const d = document.createElement('div');
  d.className = 'msg thinking';
  d.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return d;
}

function stopThinking() {
  if (thinkingEl) { thinkingEl.remove(); thinkingEl = null; }
  sendBtn.disabled = false;
  sendBtn.textContent = 'Send';
}

function submit() {
  const text = inputEl.value.trim();
  if (!text || sendBtn.disabled) return;
  addMsg(text, 'user');
  inputEl.value = '';
  inputEl.style.height = 'auto';
  thinkingEl = showThinking();
  sendBtn.disabled = true;
  sendBtn.textContent = '…';
  vscode.postMessage({ type: 'chat', text, intent: activeIntent });
}

sendBtn.addEventListener('click', submit);
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
});
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

window.addEventListener('message', e => {
  const ev = e.data;

  if (ev.type === 'status') {
    if (!ev.ok) {
      statusText.textContent = '⚠ Backend offline — cd backend && npm run dev';
      statusBanner.style.display = 'flex';
    } else {
      statusBanner.style.display = 'none';
    }
    return;
  }

  if (ev.type === 'fileContext') {
    fileCtx.textContent = ev.fileName ? '📄 ' + ev.fileName : 'No file open';
    return;
  }

  if (ev.type === 'actionDone') {
    const card = document.getElementById('ac-' + ev.msgId);
    if (card) {
      const details = Array.isArray(ev.results)
        ? ev.results.map(r => '<div>' + escapeHtml(r.detail) + '</div>').join('')
        : '';
      card.innerHTML = '<span style="opacity:.6">Applied actions.</span>' + details;
    }
    return;
  }

  if (ev.type === 'actionError') {
    const card = document.getElementById('ac-' + ev.msgId);
    if (card) card.innerHTML = '<span style="color:var(--vscode-errorForeground,#f48771)">⚠ ' + ev.text + '</span>';
    return;
  }

  stopThinking();

  if (ev.type === 'reply') {
    const id = ++msgCounter;
    const d = addMsg(renderMarkdown(ev.text), 'ai', true);
    if (ev.actions && ev.actions.length > 0) {
      const card = document.createElement('div');
      card.className = 'action-card';
      card.id = 'ac-' + id;
      card.innerHTML =
        '<p>⚡ AI prepared <strong>' + ev.actions.length + '</strong> action(s) that need your approval.</p>' +
        '<div class="action-list">' + renderActions(ev.actions) + '</div>' +
        '<div class="act-btns">' +
        '<button class="act-btn act-apply" onclick="applyActions(' + id + ')">Apply</button>' +
        '<button class="act-btn act-skip" onclick="skipActions(' + id + ')">Skip</button>' +
        '</div>';
      d.appendChild(card);
      window['_actions_' + id] = ev.actions;
    }
  } else if (ev.type === 'error') {
    addMsg('⚠ ' + ev.text, 'error');
  }

  inputEl.focus();
});

function applyActions(id) {
  const card = document.getElementById('ac-' + id);
  card.querySelectorAll('.act-btn').forEach(b => b.disabled = true);
  vscode.postMessage({ type: 'actionConfirm', msgId: id, actions: window['_actions_' + id] });
}

function skipActions(id) {
  const card = document.getElementById('ac-' + id);
  card.innerHTML = '<span style="opacity:.5">Actions skipped.</span>';
  delete window['_actions_' + id];
}

inputEl.focus();
doHealthCheck();
</script>
</body>
</html>`;
  }
}
