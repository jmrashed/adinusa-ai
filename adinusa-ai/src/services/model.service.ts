import * as vscode from 'vscode';

export type Provider = 'glm' | 'openai' | 'claude' | 'gemini' | 'ollama';

export interface ModelConfig {
  provider: Provider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export function getModelConfig(): ModelConfig {
  const cfg = vscode.workspace.getConfiguration('adinusaAi');
  const provider = cfg.get<Provider>('provider') ?? 'glm';

  switch (provider) {
    case 'openai':
      return {
        provider,
        apiKey: cfg.get<string>('openai.apiKey'),
        model: cfg.get<string>('openai.model') ?? 'gpt-4o',
      };
    case 'claude':
      return {
        provider,
        apiKey: cfg.get<string>('claude.apiKey'),
        model: cfg.get<string>('claude.model') ?? 'claude-3-5-sonnet-20241022',
      };
    case 'gemini':
      return {
        provider,
        apiKey: cfg.get<string>('gemini.apiKey'),
        model: cfg.get<string>('gemini.model') ?? 'gemini-1.5-pro',
      };
    case 'ollama':
      return {
        provider,
        baseUrl: cfg.get<string>('ollama.baseUrl') ?? 'http://localhost:11434',
        model: cfg.get<string>('ollama.model') ?? 'llama3',
      };
    case 'glm':
    default:
      return {
        provider: 'glm',
        apiKey: cfg.get<string>('glm.apiKey'),
        model: cfg.get<string>('glm.model') ?? 'glm-4-flash',
      };
  }
}

export function validateModelConfig(config: ModelConfig): string | null {
  if (config.provider === 'ollama') return null;
  if (!config.apiKey || config.apiKey.trim() === '') {
    return `No API key set for provider "${config.provider}". Go to Settings (Ctrl+,) and search "Adinusa" to configure.`;
  }
  return null;
}
