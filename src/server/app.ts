import express, { Application } from 'express';
import cors from 'cors';
import appRoutes from './routes';
import logger from '@config/logger';
import { pinoHttp } from 'pino-http';

export const createApp = (prefix: string): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(express.urlencoded({ extended: true }));

  app.use(`/${prefix}`, appRoutes);

  return app;
};
