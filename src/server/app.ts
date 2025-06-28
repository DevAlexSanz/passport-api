import express, { Application } from 'express';
import cors from 'cors';
import appRoutes from './routes';

export const createApp = (prefix: string): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(`/${prefix}`, appRoutes);

  return app;
};
