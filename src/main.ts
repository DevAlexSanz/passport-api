import 'reflect-metadata';

import { Server } from '@server/server';
import { env } from '@config/config';
import logger from '@config/logger';

const bootstrap = () => {
  try {
    const server = new Server(env.PORT, 'api');

    server.start();
  } catch (error) {
    logger.error(error);
  }
};
bootstrap();
