import 'reflect-metadata';

import { Server } from '@server/server';

const bootstrap = () => {
  try {
    const port = Number(process.env.PORT ?? 8080);
    const server = new Server(port, 'v1');

    server.start();
  } catch (error) {
    console.error(error);
  }
};
bootstrap();
