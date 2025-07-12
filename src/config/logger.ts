import pino from 'pino';
import { env } from './config';

const isProduction = env.NODE_ENV === 'production';

const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true },
      },
});

export default logger;
