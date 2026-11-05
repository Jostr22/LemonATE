import { createApp } from './app.js';
import { assertEnv, env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

async function main() {
  assertEnv();
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[lemonate] API escuchando en http://localhost:${env.port}/api`);
  });

  const shutdown = async (signal) => {
    console.log(`[lemonate] ${signal} recibido. Cerrando…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[lemonate] No se pudo iniciar el backend:', error.message);
  process.exit(1);
});
