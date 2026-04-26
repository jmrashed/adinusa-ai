/**
 * Custom security headers configuration.
 * Builds on helmet with explicit CSP, HSTS, and other protections.
 */

'use strict';

const helmet = require('helmet');
const { ENV } = require('../config/env');

const allowedOrigins = ENV.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

// Build CSP directives
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
  imgSrc: ["'self'", 'data:', 'https://raw.githubusercontent.com'],
  connectSrc: ["'self'", ...allowedOrigins],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

function securityHeadersMiddleware() {
  return helmet({
    contentSecurityPolicy: {
      directives: cspDirectives,
    },
    crossOriginEmbedderPolicy: false, // Allow embedding from different origins (VS Code webviews)
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  });
}

module.exports = { securityHeadersMiddleware };

