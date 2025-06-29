import 'reflect-metadata';

import { Server } from '@server/server';
import { env } from '@config/config';

const bootstrap = () => {
  try {
    const server = new Server(env.PORT, 'api');

    server.start();
  } catch (error) {
    console.error(error);
  }
};
bootstrap();
