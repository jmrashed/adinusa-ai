import { getBackendUrl } from '../config/settings';
import { getModelConfig, validateModelConfig } from './model.service';

export interface ChatRequest {
  message: string;
  intent?: 'explain' | 'generate' | 'fix' | 'refactor' | 'run' | 'chat';
  context?: { file?: string; selection?: string; fileName?: string; intent?: string };
}

export interface ChatResponse {
  reply: string;
  actions?: Array<{ tool: string; path?: string; content?: string; command?: string }>;
}

export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  const modelConfig = getModelConfig();

  const validationError = validateModelConfig(modelConfig);
  if (validationError) throw new Error(validationError);

  const res = await fetch(`${getBackendUrl()}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req, modelConfig }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as any).error ?? `Backend error: ${res.status}`);
  }

  return res.json() as Promise<ChatResponse>;
}
