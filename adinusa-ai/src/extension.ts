import * as vscode from 'vscode';
import { ChatPanel } from './ui/panel';
import { ChatViewProvider } from './ui/chat.view';
import { ManualPanel } from './ui/manual';
import { registerAskCommand, registerExplainCommand, registerFixCommand, registerGenerateCommand } from './commands/index';
import { getModelConfig, type Provider } from './services/model.service';

const PROVIDER_LABELS: Record<Provider, string> = {
  glm: 'GLM-4',
  openai: 'GPT-4',
  claude: 'Claude',
  gemini: 'Gemini',
  ollama: 'Ollama',
};

function createStatusBar(): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = 'adinusa-ai.openChat';
  return item;
}

function updateStatusBar(item: vscode.StatusBarItem) {
  const { provider, model } = getModelConfig();
  item.text = `$(robot) Adinusa AI · ${PROVIDER_LABELS[provider]}`;
  item.tooltip = [
    `Active model: ${model ?? provider}`,
    '',
    'Ctrl+Shift+A  — Open Chat',
    'Ctrl+Shift+/  — Ask (quick input)',
    'Ctrl+Shift+G  — Generate Code',
    'Ctrl+Shift+E  — Explain Selection',
    'Ctrl+Shift+F  — Fix Selection',
    'Ctrl+Shift+P  — Switch AI Provider',
    'Ctrl+Shift+M  — Open Manual',
  ].join('\n');
  item.show();
}

export function activate(context: vscode.ExtensionContext) {
  const statusBar = createStatusBar();
  updateStatusBar(statusBar);

  // Register sidebar chat view
  const chatViewProvider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewId, chatViewProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // Push active file name to sidebar webview
  const pushFileCtx = () =>
    chatViewProvider.notifyFileContext(vscode.window.activeTextEditor?.document.fileName.split('/').pop());
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(pushFileCtx));

  // Re-render status bar when settings change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('adinusaAi')) updateStatusBar(statusBar);
    })
  );

  const switchProvider = vscode.commands.registerCommand('adinusa-ai.switchProvider', async () => {
    const items: vscode.QuickPickItem[] = [
      { label: '$(sparkle) GLM-4', description: 'Zhipu AI — glm-4-flash / glm-4', detail: 'provider: glm' },
      { label: '$(sparkle) GPT-4', description: 'OpenAI — gpt-4o / gpt-4-turbo', detail: 'provider: openai' },
      { label: '$(sparkle) Claude', description: 'Anthropic — claude-3-5-sonnet / claude-3-opus', detail: 'provider: claude' },
      { label: '$(sparkle) Gemini', description: 'Google — gemini-1.5-pro / gemini-1.5-flash', detail: 'provider: gemini' },
      { label: '$(sparkle) Ollama', description: 'Local — llama3 / codellama / mistral / deepseek-coder', detail: 'provider: ollama' },
    ];

    const picked = await vscode.window.showQuickPick(items, {
      title: 'Adinusa AI — Select AI Provider',
      placeHolder: 'Choose the AI provider to use',
    });

    if (!picked) return;

    const providerMap: Record<string, Provider> = {
      'provider: glm': 'glm',
      'provider: openai': 'openai',
      'provider: claude': 'claude',
      'provider: gemini': 'gemini',
      'provider: ollama': 'ollama',
    };

    const provider = providerMap[picked.detail!];
    const cfg = vscode.workspace.getConfiguration('adinusaAi');
    await cfg.update('provider', provider, vscode.ConfigurationTarget.Global);

    // Prompt for API key if not set
    if (provider !== 'ollama') {
      const keyField = `${provider}.apiKey`;
      const existing = cfg.get<string>(keyField);
      if (!existing || existing.trim() === '') {
        const key = await vscode.window.showInputBox({
          title: `Enter your ${PROVIDER_LABELS[provider]} API key`,
          prompt: `Paste your API key for ${PROVIDER_LABELS[provider]}`,
          password: true,
          ignoreFocusOut: true,
        });
        if (key) {
          await cfg.update(keyField, key, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage(`Adinusa AI: Switched to ${PROVIDER_LABELS[provider]} ✓`);
        }
      } else {
        vscode.window.showInformationMessage(`Adinusa AI: Switched to ${PROVIDER_LABELS[provider]} ✓`);
      }
    } else {
      vscode.window.showInformationMessage(`Adinusa AI: Switched to Ollama (local) ✓`);
    }

    updateStatusBar(statusBar);
  });

  context.subscriptions.push(
    statusBar,
    switchProvider,
    vscode.commands.registerCommand('adinusa-ai.openChat', () => {
      chatViewProvider.focus();
      // Also open as panel if user prefers floating window via Ctrl+Shift+A
      ChatPanel.createOrShow(context.extensionUri);
    }),
    vscode.commands.registerCommand('adinusa-ai.openManual', () => ManualPanel.createOrShow()),
    registerAskCommand(context),
    registerGenerateCommand(context),
    registerExplainCommand(context),
    registerFixCommand(context),
  );
}

export function deactivate() {}
