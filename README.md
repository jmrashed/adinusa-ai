# 🚀 VS Code AI Agent Extension using GLM-5.1

## 📌 Project Overview

Build a VS Code extension that acts as an **AI coding agent** powered by GLM-5.1.
The system will allow developers to:

* Chat with AI inside VS Code
* Generate and modify code
* Execute terminal commands
* Automate development workflows

---

## 🎯 Goals

### Phase-wise Goals

#### ✅ Phase 1: Basic Chat Assistant

* VS Code command: "Ask AI"
* Send prompt → backend → GLM-5.1
* Show response in UI

#### ✅ Phase 2: Code Awareness

* Read active file content
* Send context to AI
* Generate code suggestions

#### ✅ Phase 3: Code Editing

* Replace selected code
* Insert generated code into editor

#### ✅ Phase 4: Agent Capabilities

* Multi-step reasoning
* Tool execution (file + terminal)
* Feedback loop

#### ✅ Phase 5: Advanced (Production)

* RAG (project context memory)
* Multi-model support
* Error fixing loop
* Git integration

---

## 🧩 System Architecture

```
VS Code Extension (Frontend)
    ├── Command Palette
    ├── Chat UI (Webview)
    ├── Code Context Reader
    └── Editor Actions
            ↓
Backend API (Agent Controller)
    ├── Request Handler
    ├── Planner (LLM - GLM)
    ├── Tool Executor
    ├── Memory (RAG)
    └── Loop Engine
            ↓
GLM-5.1 API
```

---

## 🛠️ Tech Stack

### Frontend (Extension)

* TypeScript
* VS Code Extension API
* Webview UI (HTML + JS)

### Backend

* Node.js (Express) or Laravel
* Axios / HTTP client
* Queue system (optional)

### AI Layer

* GLM-5.1 API
* Optional fallback models

### Storage

* File system access
* Vector DB (FAISS / Pinecone / Redis)

---

## 📁 Project Structure

```
adinusa-ai/
│
├── extension/                         # VS Code Extension (Frontend)
│   ├── src/
│   │   ├── extension.ts               # Entry point
│   │   ├── commands/                 # VS Code commands
│   │   │   ├── ask.ts
│   │   │   ├── explain.ts
│   │   │   ├── generate.ts
│   │   │   └── fix.ts
│   │   │
│   │   ├── services/                # API + logic layer
│   │   │   ├── api.service.ts
│   │   │   ├── context.service.ts   # read file, selection
│   │   │   └── editor.service.ts    # insert/replace code
│   │   │
│   │   ├── ui/                      # Webview UI (Chat panel)
│   │   │   ├── panel.ts
│   │   │   ├── chat.html
│   │   │   ├── chat.js
│   │   │   └── styles.css
│   │   │
│   │   ├── config/
│   │   │   └── settings.ts
│   │   │
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── helpers.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── esbuild.config.js
│
│
├── backend/                          # AI Agent Server (Core Brain)
│   ├── src/
│   │   ├── app.js                    # Express entry
│   │   ├── routes/
│   │   │   └── ai.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   └── ai.controller.js
│   │   │
│   │   ├── services/
│   │   │   ├── llm.service.js        # GLM-5.1 API wrapper
│   │   │   ├── agent.service.js      # planning + reasoning
│   │   │   ├── memory.service.js     # RAG memory
│   │   │   └── tool.service.js       # tool execution
│   │   │
│   │   ├── tools/                    # Agent capabilities
│   │   │   ├── file.tool.js
│   │   │   ├── terminal.tool.js
│   │   │   ├── git.tool.js
│   │   │   └── search.tool.js
│   │   │
│   │   ├── prompts/
│   │   │   ├── system.prompt.js
│   │   │   └── agent.prompt.js
│   │   │
│   │   ├── memory/                  # RAG storage layer
│   │   │   ├── vector.store.js
│   │   │   └── embeddings.js
│   │   │
│   │   └── utils/
│   │       ├── logger.js
│   │       └── validator.js
│   │
│   ├── .env
│   ├── package.json
│   └── README.md
│
│
├── shared/                           # Shared logic (optional but powerful)
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── models.ts
│   └── utils/
│       └── common.ts
│
│
├── docs/
│   ├── plan.md                       # Your design doc
│   ├── architecture.md
│   └── api-spec.md
│
│
├── scripts/
│   ├── build.sh
│   ├── dev.sh
│   └── release.sh
│
│
├── .gitignore
├── pnpm-workspace.yaml              # Monorepo config
└── README.md

```

---

## 🔌 Core Features

### 1. Chat System

* Input prompt from VS Code
* Send to backend
* Display formatted response

---

### 2. Code Context Awareness

* Read current file
* Send:

  * file content
  * cursor position
  * selected code

---

### 3. Code Generation

* Generate:

  * functions
  * APIs
  * full modules

---

### 4. File System Tool

Capabilities:

* Create file
* Update file
* Delete file
* Read file

---

### 5. Terminal Tool

Capabilities:

* Run commands (npm, composer, git)
* Capture output
* Return to agent

---

### 6. Agent Loop

```
User Request
   ↓
Planner (GLM)
   ↓
Action निर्णय
   ↓
Tool Execution
   ↓
Result Feedback
   ↓
Repeat until done
```

---

## 🧠 Agent Design

### Prompt Template

```
You are an AI coding agent.

Goal:
{user_input}

Available tools:
- write_file(path, content)
- run_command(cmd)

Return:
Step-by-step plan and next action in JSON format.
```

---

### Action Format (JSON)

```
{
  "action": "write_file",
  "path": "routes/api.php",
  "content": "<?php ... ?>"
}
```

---

## 🔄 API Design

### POST /ai/chat

Request:

```
{
  "message": "Create Laravel CRUD",
  "context": {
    "file": "...",
    "selection": "..."
  }
}
```

Response:

```
{
  "reply": "Generated code...",
  "actions": []
}
```

---

## 🧪 Development Phases

### Phase 1 (Week 1)

* Setup extension
* Connect backend
* Basic chat working

### Phase 2 (Week 2)

* Code context reading
* Code generation

### Phase 3 (Week 3)

* File system tool
* Code editing

### Phase 4 (Week 4)

* Terminal tool
* Agent loop

### Phase 5 (Week 5+)

* RAG integration
* Multi-model routing
* Optimization

---

## ⚠️ Challenges & Solutions

### ❗ Challenge: Unsafe code execution

✔ Solution:

* Sandbox commands
* Restrict allowed commands

---

### ❗ Challenge: Large context

✔ Solution:

* Use chunking
* RAG-based retrieval

---

### ❗ Challenge: Infinite loops

✔ Solution:

* Max iteration limit
* Timeout control

---

## 🔐 Security Considerations

* Validate all file paths
* Restrict system commands
* API authentication
* Rate limiting

---

## 🚀 Future Enhancements

* Voice-based coding assistant
* Team collaboration agent
* Auto documentation generator
* CI/CD automation agent

---

## 🎯 Success Criteria

* Can generate and modify code from prompt
* Can execute basic dev tasks
* Works smoothly inside VS Code
* Scalable backend architecture

---

## 🏁 Final Vision

Build a **"Mini Cursor / Devin-like AI Developer"** powered by GLM-5.1
that can:

* Understand codebase
* Write production-ready code
* Automate development tasks
 
