<div align="center">

<img src="https://raw.githubusercontent.com/jmrashed/adinusa-ai/main/adinusa-ai/assets/icon.png" alt="Adinusa AI Logo" width="120" />

# Adinusa AI

**An autonomous AI coding agent inside Visual Studio Code, powered by GLM-4.**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/jmrashed/adinusa-ai/releases)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.90.0-007ACC?logo=visualstudiocode)](https://code.visualstudio.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=nodedotjs)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Configuration](#-configuration) · [Contributing](#-contributing)

</div>

---

## Overview

Adinusa AI is a full-stack VS Code extension that brings an autonomous AI software engineering agent directly into your editor. It connects to a local Express backend that orchestrates a multi-step reasoning loop powered by the [Zhipu GLM-4](https://open.bigmodel.cn/) language model.

Unlike simple autocomplete tools, Adinusa AI can **plan**, **reason**, **write files**, and **execute terminal commands** — all from a natural language prompt inside VS Code.

---

## Features

| Feature | Description |
|---|---|
| **Chat Panel** | Full markdown-rendered chat UI inside VS Code (Ctrl+Shift+A) |
| **Code Generation** | Generate functions, APIs, and full modules from a prompt |
| **Code Explanation** | Explain any selected code in plain language |
| **Code Fixing** | Fix selected buggy or broken code automatically |
| **Editor Context** | Sends active file content and selection to the AI automatically |
| **Agent Actions** | AI can create files and run terminal commands with your approval |
| **Status Bar** | One-click access to the chat panel from the VS Code status bar |
| **Keybindings** | Full keyboard shortcut support for all commands |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           VS Code Extension                  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Chat UI  │  │ Commands │  │ Services │  │
│  │ (Webview)│  │ Ask      │  │ Context  │  │
│  │ Markdown │  │ Generate │  │ Editor   │  │
│  │ Rendering│  │ Explain  │  │ Actions  │  │
│  └────┬─────┘  │ Fix      │  └──────────┘  │
│       │        └────┬─────┘                │
└───────┼─────────────┼────────────────────--┘
        │             │  HTTP POST /ai/chat
        ▼             ▼
┌─────────────────────────────────────────────┐
│           Express Backend                    │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │           Agent Loop                 │   │
│  │  User Message → GLM-4 → Parse JSON   │   │
│  │  → Execute Tools → Feedback → Repeat │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  Tools: write_file · read_file · run_cmd    │
│  Security: helmet · rate-limit · validation │
└───────────────────┬─────────────────────────┘
                    │  HTTPS
                    ▼
        ┌───────────────────────┐
        │   Zhipu GLM-4 API     │
        │  open.bigmodel.cn     │
        └───────────────────────┘
```

---

## Project Structure

```
adinusa-ai/                         # Monorepo root
│
├── adinusa-ai/                     # VS Code Extension (TypeScript)
│   ├── src/
│   │   ├── extension.ts            # Entry point + status bar
│   │   ├── commands/
│   │   │   └── index.ts            # Ask, Generate, Explain, Fix
│   │   ├── services/
│   │   │   ├── api.service.ts      # HTTP client → backend
│   │   │   ├── context.service.ts  # Active file + selection reader
│   │   │   ├── editor.service.ts   # Insert / replace code in editor
│   │   │   └── action.service.ts   # Apply agent file/terminal actions
│   │   ├── ui/
│   │   │   └── panel.ts            # Webview chat panel + markdown renderer
│   │   ├── config/
│   │   │   └── settings.ts         # VS Code settings reader
│   │   └── utils/
│   │       └── logger.ts           # Output channel logger
│   ├── .vscode/
│   │   ├── launch.json             # F5 debug config
│   │   └── tasks.json              # Build task
│   ├── package.json
│   ├── tsconfig.json
│   └── esbuild.js
│
├── backend/                        # Agent Server (Node.js / Express)
│   ├── src/
│   │   ├── app.js                  # Express entry, middleware, routes
│   │   ├── controllers/
│   │   │   └── ai.controller.js    # Request validation + response
│   │   ├── routes/
│   │   │   └── ai.routes.js        # POST /ai/chat
│   │   ├── services/
│   │   │   ├── agent.service.js    # Multi-step agent loop
│   │   │   └── llm.service.js      # GLM-4 API wrapper
│   │   ├── tools/
│   │   │   ├── file.tool.js        # Safe file read/write
│   │   │   └── terminal.tool.js    # Sandboxed command execution
│   │   ├── prompts/
│   │   │   └── system.prompt.js    # Agent system prompt
│   │   └── utils/
│   │       └── logger.js
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── scripts/
│   ├── install.sh                  # Install all dependencies
│   └── dev.sh                      # Start backend + extension watcher
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [VS Code](https://code.visualstudio.com/) >= 1.90.0
- A [Zhipu AI API key](https://open.bigmodel.cn/) (free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/jmrashed/adinusa-ai.git
cd adinusa-ai
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your API key:

```env
ZHIPU_API_KEY=your_api_key_here
PORT=3002
GLM_MODEL=glm-4-flash
MAX_AGENT_ITERATIONS=5
RATE_LIMIT=30
```

### 3. Install dependencies

```bash
bash scripts/install.sh
```

### 4. Start the backend

```bash
cd backend && npm run dev
```

Verify it's running:

```bash
curl http://localhost:3002/health
# {"status":"ok","version":"0.1.0"}
```

### 5. Launch the extension

Open the `adinusa-ai/` folder in VS Code and press **F5**.

A new **Extension Development Host** window opens. You'll see the `$(robot) Adinusa AI` item in the status bar.

---

## Usage

### Open Chat Panel

Press `Ctrl+Shift+A` (Mac: `Cmd+Shift+A`) or click the status bar item.

Type any message and press `Enter`. The AI responds with markdown-rendered output including syntax-highlighted code blocks.

### Commands

| Command | Shortcut | Description |
|---|---|---|
| `Adinusa AI: Open Chat` | `Ctrl+Shift+A` | Open the chat panel |
| `Adinusa AI: Ask` | — | Quick question via input box |
| `Adinusa AI: Generate Code` | `Ctrl+Shift+G` | Generate code at cursor |
| `Adinusa AI: Explain Selection` | `Ctrl+Shift+E` | Explain selected code |
| `Adinusa AI: Fix Selection` | `Ctrl+Shift+F` | Fix selected code |

All commands are also available via right-click context menu in the editor.

### Agent Actions

When the AI decides to create files or run commands, VS Code shows a confirmation prompt:

```
Adinusa AI wants to execute 2 action(s). Apply?   [Apply] [Skip]
```

- **Apply** — files are created and opened in the editor; commands run in a new terminal
- **Skip** — actions are ignored, only the text reply is shown

---

## API Reference

### `POST /ai/chat`

Send a message to the agent.

**Request**

```json
{
  "message": "Create a Node.js Express REST API with CRUD for users",
  "context": {
    "fileName": "/path/to/current/file.ts",
    "file": "// current file content...",
    "selection": "// selected code (optional)"
  }
}
```

**Response**

```json
{
  "reply": "Here is the generated Express API...",
  "actions": [
    {
      "tool": "write_file",
      "path": "src/routes/users.js",
      "content": "const express = require('express');\n..."
    }
  ]
}
```

**Error responses**

| Status | Meaning |
|---|---|
| `400` | Missing or invalid `message` field |
| `429` | Rate limit exceeded (30 req/min) |
| `500` | Agent or LLM error |

### `GET /health`

```json
{ "status": "ok", "version": "0.1.0" }
```

---

## Configuration

### VS Code Settings

| Setting | Default | Description |
|---|---|---|
| `adinusaAi.backendUrl` | `http://localhost:3002` | Backend API URL |

Open VS Code Settings (`Ctrl+,`) and search for `Adinusa` to configure.

### Backend Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ZHIPU_API_KEY` | — | **Required.** Your Zhipu AI API key |
| `PORT` | `3002` | Server port |
| `GLM_MODEL` | `glm-4-flash` | GLM model to use |
| `MAX_AGENT_ITERATIONS` | `5` | Max agent reasoning steps (hard cap: 10) |
| `RATE_LIMIT` | `30` | Max requests per minute per IP |
| `ALLOWED_ORIGINS` | `vscode-webview://*` | Comma-separated CORS origins |

---

## Docker

Run the backend with Docker:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

Or build manually:

```bash
cd backend
docker build -t adinusa-ai-backend .
docker run -p 3002:3002 --env-file .env adinusa-ai-backend
```

---

## Security

- **Path traversal protection** — all file operations are restricted to the workspace root
- **Command blocklist** — destructive commands (`rm -rf`, `mkfs`, `dd`, `shutdown`) are blocked
- **Rate limiting** — 30 requests/minute per IP via `express-rate-limit`
- **HTTP security headers** — enforced via `helmet`
- **Input validation** — message type, length (max 8000 chars), and presence are validated
- **CORS** — restricted to configured origins only
- **Secrets** — `.env` is gitignored; only `.env.example` is committed

---

## Roadmap

- [ ] Streaming responses (SSE / WebSocket)
- [ ] RAG — project-level context memory (FAISS / Pinecone)
- [ ] Multi-model support (GPT-4, Claude, Ollama)
- [ ] Git integration (auto-commit, diff review)
- [ ] Error fixing loop (run → catch error → auto-fix)
- [ ] VS Code Marketplace publish
- [ ] Voice input support
- [ ] Team collaboration mode

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions and guidelines.

```bash
# Fork → clone → branch
git checkout -b feat/your-feature

# Make changes, then
cd adinusa-ai && npm run check-types

# Commit and open a PR
git commit -m "feat: your feature description"
```

---

## License

[MIT](./LICENSE) © 2025 Adinusa AI
