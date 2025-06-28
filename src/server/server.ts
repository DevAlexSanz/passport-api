import { Application, Request, Response } from 'express';
import { jsonResponse } from '@utils/json-response';
import { createApp } from './app';

export class Server {
  private readonly app: Application;
  private readonly port: number;

  constructor(port: number, prefix = '') {
    this.app = createApp(prefix);
    this.port = Number(port);
  }

  private healthRoute(): void {
    this.app.get('/health', (_request: Request, response: Response) => {
      jsonResponse(response, {
        message: 'OK',
        statusCode: 200,
        success: true,
      });
    });
  }

  public start(): void {
    this.healthRoute();

    this.app.listen(this.port, () => {
      console.log(`✔️  Server listening and running on port: ${this.port}`);
    });
  }
}
