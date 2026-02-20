import { env } from './env.js';

export async function setupTelemetry(): Promise<void> {
  if (!env.OTEL_ENABLED) {
    return;
  }

  const { NodeSDK } = await import('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');

  const sdk = new NodeSDK({
    serviceName: env.OTEL_SERVICE_NAME,
    instrumentations: [getNodeAutoInstrumentations()]
  });

  await sdk.start();

  process.on('SIGTERM', async () => {
    await sdk.shutdown();
  });
}
