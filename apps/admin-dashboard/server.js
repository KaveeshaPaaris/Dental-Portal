/**
 * Hostinger Node.js entry point for Next.js standalone deployment in a MONOREPO.
 *
 * Next.js standalone mode recreates the monorepo structure inside .next/standalone/
 * So the actual server is at .next/standalone/apps/admin-dashboard/server.js
 * and the bundled node_modules are at .next/standalone/node_modules/
 */
'use strict';
require('./.next/standalone/apps/admin-dashboard/server.js');
