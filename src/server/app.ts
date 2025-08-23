import express, { Application } from 'express';
import passport from 'passport';
import cors from 'cors';
import appRoutes from './routes';
import logger from '@config/logger';
import { pinoHttp } from 'pino-http';
import cookieParser from 'cookie-parser';
import { corsWhitelistValidator } from '@config/cors';
import { env } from '@config/config';

export const createApp = (prefix: string): Application => {
  const app = express();

  app.use(cors(corsWhitelistValidator(env.CORS_WHITELIST)));
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());

  app.use(`/${prefix}`, appRoutes);

  return app;
};
