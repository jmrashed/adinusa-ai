# Adinusa AI Backend

Express server powering the Adinusa AI agent (VS Code extension). Handles LLM provider routing (GLM, OpenAI, Claude, Gemini, Ollama) and executes the agent's tool loop (read/write files, run commands, search).

See the [root README](../README.md) for architecture, quick start, and full API reference.

## Structure

```
src/
  app.js          # Express app entrypoint
  config/         # provider/env config
  controllers/     # route handlers
  middleware/      # request id, logging, error handling, security headers, timeout
  prompts/         # agent system prompts
  routes/          # route definitions
  services/        # agent.service, llm.service, per-provider clients
  tools/           # agent tool implementations (read_file, write_file, run_command, ...)
  utils/           # shared helpers
```

## Development

```bash
pnpm install
cp .env.example .env   # fill in provider API keys
pnpm --filter backend dev
```

## Scripts

| Script | Purpose |
|---|---|
| `pnpm --filter backend dev` | Run with nodemon |
| `pnpm --filter backend start` | Run in production mode |
| `pnpm --filter backend test` | Run Jest tests |
| `pnpm --filter backend test:coverage` | Run tests with coverage report |
| `pnpm --filter backend lint` | ESLint |

## Environment variables

See [.env.example](.env.example) for the full list (server config, provider API keys, logging, Sentry DSN).

## Docker

Build from the **repo root** (the image needs the workspace-wide `pnpm-lock.yaml`):

```bash
docker build -f backend/Dockerfile -t adinusa-ai-backend .
```

Or via `docker-compose up` from the repo root.
