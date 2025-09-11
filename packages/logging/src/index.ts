import pino from 'pino';
import { join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const logDir = join(process.cwd(), 'logs');
const logFilePath = join(logDir, 'app.log');

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const fileStream = pino.destination({ dest: logFilePath, sync: false });

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    formatters: { level: (label) => ({ level: label }) },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
  pino.multistream([
    {
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }),
    },
    { stream: fileStream },
  ])
);

logger.info(`Logging to file: ${logFilePath}`);
