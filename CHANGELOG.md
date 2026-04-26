# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-04-27

### Added
- Project configuration files: .editorconfig, .prettierrc, .nvmrc, .node-version
- CI/CD pipeline with GitHub Actions workflow
- Dependabot configuration for automated dependency updates
- Husky pre-commit hooks for code quality enforcement
- Jest test configurations for both frontend and backend
- Environment configuration system with structured env validation
- Request ID middleware for distributed tracing
- Request logging middleware with structured logging
- Security headers middleware for enhanced HTTP security
- Request timeout middleware for improved reliability
- Error handling middleware with centralized error management
- ESLint configurations for consistent code style (root and backend)
- EditorConfig for consistent editor settings across IDEs
- VS Code launch and task configurations for development workflow
- CODE_OF_CONDUCT.md, SECURITY.md, and contributing guidelines
- Backend health check endpoint and monitoring
- Docker Compose and Kubernetes deployment configurations
- Environment example files for backend configuration
- Open API specification for backend API documentation
- Ecosystem configuration for process management
- Cross-platform development environment setup
- Structured logger utility for JSON-formatted logs
- Backward-compatible logger wrapper
- Environment variable validation at startup
- Graceful shutdown handling for SIGTERM and SIGINT
- Request body size limiting middleware
- API route modularization
- Dependency update automation via Dependabot
- Pre-commit hooks for linting and formatting
- Test scripts with coverage reporting
- Build and package scripts for extension
- Clean and reset scripts for development

### Fixed
- Agent no longer executes `write_file` or `run_command` automatically — always requires user approval
- Removed shadowed variable bug in panel.ts message handler (already fixed in 0.2.0)
- Fixed version numbers in package.json files
- Fixed missing ESLint configuration in root directory
- Fixed missing test scripts in package.json
- Fixed missing lint scripts configuration
- Fixed missing Prettier configuration
- Fixed missing editorconfig file

### Improved
- Action approval flow now fully inline with no VS Code notification popup interruption
- System prompt clarity on when to use `write_file` vs return code in `final_answer`
- Backend returns `meta.iterations` for debugging agent loop duration
- Enhanced project structure with clear separation of frontend, backend, and configuration
- Improved development workflow with automated linting and pre-commit checks
- Better error handling and logging throughout the application
- Enhanced security posture with security headers and input validation
- More maintainable codebase with consistent formatting and linting rules
- Standardized dependency versions across workspaces
- Improved Dockerfile with multi-stage build considerations
- Added compression middleware for API responses
- Added CORS configuration with specific allowed origins
- Added rate limiting for AI endpoints
- Added helmet security with customized CSP
- Added structured logging capabilities
- Added request ID correlation for distributed tracing
- Added graceful shutdown procedures
- Added environment validation before server startup
- Added request timeout handling
- Added error handling middleware with centralized management
- Added security headers middleware for enhanced protection
- Added OpenAPI documentation for API contract
- Added ecosystem configuration for process management
- Added Kubernetes manifests for orchestration
- Added comprehensive test suites
- Added linting and formatting automation
- Added pre-commit hooks for code quality
- Added version pinning for Node.js
- Added automated dependency updates via Dependabot
- Added security auditing in CI pipeline
- Added test coverage reporting
- Added extension packaging and build automation
- Added clean and reset development utilities

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
