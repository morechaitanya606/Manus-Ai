import { env } from './env.js';

export const loggerConfig = {
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      }
    : {}),
  serializers: {
    req(request: any) {
      return {
        method: request.method,
        url: request.url,
        id: request.id
      };
    }
  }
} as const;
