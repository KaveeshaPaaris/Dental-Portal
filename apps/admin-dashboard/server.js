/**
 * Hostinger Node.js entry point for Next.js standalone deployment.
 *
 * WHY THIS EXISTS:
 * - This is a monorepo: npm hoists `next` to the repo root node_modules/
 * - Hostinger only deploys apps/admin-dashboard/ to /nodejs/, so root node_modules are gone
 * - Hostinger's default server.js template does require('next') which fails
 *
 * THE FIX:
 * - `next build` with output:'standalone' creates .next/standalone/ with its own
 *   embedded node_modules (including next) — completely self-contained
 * - We just delegate to that standalone server here
 */
'use strict';
require('./.next/standalone/server.js');
