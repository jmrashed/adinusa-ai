# Contributing to Adinusa AI

## Setup

```bash
# Install all dependencies
bash scripts/install.sh

# Start dev servers
bash scripts/dev.sh
```

## Project Structure

- `adinusa-ai/` — VS Code Extension (TypeScript)
- `backend/` — Express Agent Server (Node.js)

## Extension Development

```bash
cd adinusa-ai
npm run watch   # watch mode
# Press F5 in VS Code to launch Extension Development Host
```

## Backend Development

```bash
cd backend
npm run dev     # nodemon watch mode
```

## Environment

Copy `backend/.env.example` to `backend/.env` and fill in your `ZHIPU_API_KEY`.

## Pull Requests

- Keep PRs focused and small
- Run `npm run check-types` before submitting
- Follow existing code style
