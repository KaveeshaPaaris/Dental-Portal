import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║       🦷 Dental API Server Running       ║
  ║  Port: ${PORT}                               ║
  ║  Env:  ${env.NODE_ENV.padEnd(34)}║
  ╚══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  server.close(() => process.exit(0));
});

export default server;
