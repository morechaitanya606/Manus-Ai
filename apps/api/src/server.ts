import { buildApp } from './app.js';
import { env } from './config/env.js';
import { setupTelemetry } from './config/otel.js';

async function start() {
  await setupTelemetry();

  const app = await buildApp();

  const close = async (signal: string) => {
    app.log.info({ signal }, 'shutting_down');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void close('SIGTERM');
  });

  process.on('SIGINT', () => {
    void close('SIGINT');
  });

  process.on('unhandledRejection', (error) => {
    app.log.error({ err: error }, 'unhandled_rejection');
  });

  process.on('uncaughtException', (error) => {
    app.log.error({ err: error }, 'uncaught_exception');
    process.exit(1);
  });

  await app.listen({
    host: env.HOST,
    port: env.PORT
  });
}

void start();
