# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-04-27

### Added
- Workspace search tools: `list_files` and `search_files` for agent file discovery
- Code extraction engine — separates code blocks from prose, applies directly to editor
- Separate `code` and `language` fields in API response for direct editor insertion
- Diagnostic integration — VS Code errors/warnings included in context for `fix` intent
- Workspace root validation — requires open folder for all file and command operations
- AgentAction metadata: `id`, `risk` (low/medium/high), `preview` for richer UI
- Server-side vs approval tool separation — read/list/search run automatically; write/run require user approval
- Expanded command blocklist: `sudo`, `chmod 777`, `chown`, fork bombs (`:(){`), and multiline command protection
- Per-action status feedback in UI — individual success/failure details after Apply
- Action cards now show tool type, preview text, and risk level inline
- `search.tool.js` — ripgrep-based workspace file listing and full-text search
- `logger.warn()` method for structured warning logging

### Fixed
- Agent no longer executes `write_file` or `run_command` automatically — always requires user approval
- Removed shadowed variable bug in panel.ts message handler (already fixed in 0.2.0)

### Improved
- Action approval flow now fully inline with no VS Code notification popup interruption
- System prompt clarity on when to use `write_file` vs return code in `final_answer`
- Backend returns `meta.iterations` for debugging agent loop duration

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
