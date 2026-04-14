import { getBackendUrl } from '../config/settings';

export interface ChatRequest {
  message: string;
  context?: { file?: string; selection?: string; fileName?: string };
}

export interface ChatResponse {
  reply: string;
  actions?: Array<{ tool: string; path?: string; content?: string; command?: string }>;
}

export async function sendChat(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${getBackendUrl()}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return res.json() as Promise<ChatResponse>;
}
