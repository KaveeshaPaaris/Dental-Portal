// Build helper for Hostinger.
// Hostinger only lets us pick "npm run build" as the build command, so each site
// chooses which app to build with an environment variable instead:
//   BUILD_TARGET=admin-dashboard | public-web | dental-api
// If BUILD_TARGET is not set, everything is built (same as before).
const { spawnSync } = require('node:child_process');

const target = (process.env.BUILD_TARGET || '').trim();
const allowed = ['admin-dashboard', 'public-web', 'dental-api'];

if (target && !allowed.includes(target)) {
  console.error(`Unknown BUILD_TARGET "${target}". Use one of: ${allowed.join(', ')}`);
  process.exit(1);
}

const args = ['turbo', 'run', 'build'];
if (target) {
  args.push(`--filter=${target}`);
  console.log(`Building only: ${target}`);
} else {
  console.log('BUILD_TARGET not set - building all apps');
}

const result = spawnSync('npx', args, { stdio: 'inherit', shell: true });
process.exit(result.status ?? 1);
