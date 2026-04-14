# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-04-15

### Added
- Intent selector in sidebar chat (Chat / Generate / Explain / Fix) — intent is forwarded to the backend agent
- Inline action confirmation card inside the AI reply bubble (Apply / Skip) replacing the VS Code notification popup
- Copy button on every fenced code block with "Copied!" feedback
- Animated three-dot thinking indicator while waiting for a response
- Timestamp on every message (user and AI)
- Active file context indicator in the chat toolbar (updates on editor tab change)
- Clear chat button in the toolbar
- Backend health check banner with Retry button
- Auto-focus and auto-resize textarea (grows up to 120 px)
- `notifyFileContext()` method on `ChatViewProvider` wired to `onDidChangeActiveTextEditor`

### Fixed
- `msg` variable shadowing bug in the webview message handler (parameter renamed to `event`, inner read renamed to `ev`)
- Health check no longer uses a dynamic `import()` — uses the already-imported `getBackendUrl` directly

## [0.1.0] - 2025-04-15

### Added
- Initial release of Adinusa AI VS Code Extension
- Chat panel with markdown rendering (Ctrl+Shift+A)
- Ask, Generate, Explain, Fix commands with keybindings
- Editor context awareness (active file + selection)
- Agent action execution (write_file, run_command) with user confirmation
- Status bar item
- Express backend with GLM-4 agent loop
- Rate limiting, helmet security, input validation
- Docker support
