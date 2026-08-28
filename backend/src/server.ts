import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`\n[INFO] Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  console.log(`[INFO] Healthcheck available at: http://localhost:${env.PORT}/health\n`);
});

// Graceful Shutdown
const shutdown = (signal: string) => {
  console.log(`\n[INFO] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[INFO] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
