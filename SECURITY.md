# Security Policy

## Supported Versions

The following versions of Adinusa AI are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| < 0.3.0 | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Adinusa AI, please report it responsibly.

**Please do NOT open a public issue for security vulnerabilities.**

Instead, send an email to: **jmrashed@gmail.com**

Include the following details:
- A description of the vulnerability
- Steps to reproduce the issue
- Possible impact
- Any suggested fixes or mitigations

We aim to respond within 48 hours and will work with you to verify and address the issue promptly.

## Security Measures

Adinusa AI implements the following security controls:

- **Path traversal protection** — All file operations are restricted to the workspace root
- **Command blocklist** — Destructive commands (`rm -rf`, `mkfs`, `dd`, `shutdown`, `sudo`) are blocked
- **Rate limiting** — Requests are limited per IP address
- **HTTP security headers** — Enforced via Helmet (CSP, HSTS, X-Frame-Options, etc.)
- **Input validation** — Message type, length (max 8000 chars), and provider validation
- **CORS** — Restricted to configured origins only
- **Secure headers** — Custom Content Security Policy tailored for VS Code webviews
- **Request timeouts** — All requests have a configurable timeout to prevent hanging
- **Graceful shutdown** — Proper connection draining on SIGTERM/SIGINT

## Best Practices for Deployment

1. **Use HTTPS** in production — The backend should be served behind a reverse proxy (nginx, Caddy, Traefik) with TLS termination
2. **Keep dependencies updated** — Run `npm audit` regularly and apply security patches
3. **Use strong API keys** — Store LLM provider keys in environment variables, never commit them
4. **Restrict network access** — Bind the backend to localhost or an internal network unless exposed through a gateway
5. **Enable Sentry** — Set `SENTRY_DSN` for automatic error tracking and alerting
6. **Review logs** — Monitor structured logs for suspicious patterns or repeated failures

## Disclosure Policy

We follow a coordinated disclosure policy:

1. Reporter submits vulnerability privately
2. We acknowledge receipt within 48 hours
3. We investigate and develop a fix
4. We release a patched version
5. We publicly disclose the vulnerability with credit to the reporter (if desired)

## Acknowledgments

We thank all security researchers and contributors who help keep Adinusa AI safe.

