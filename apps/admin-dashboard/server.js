/**
 * Hostinger Node.js entry point for Next.js standalone deployment in a MONOREPO.
 *
 * Next.js standalone mode recreates the monorepo structure inside .next/standalone/
 * So the actual server is at .next/standalone/apps/admin-dashboard/server.js
 * and the bundled node_modules are at .next/standalone/node_modules/
 */
'use strict';
// Keep image-processing and background thread pools small: the account has a 120-process limit.
process.env.VIPS_CONCURRENCY = process.env.VIPS_CONCURRENCY || '1';
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '4';
require('./.next/standalone/apps/admin-dashboard/server.js');
