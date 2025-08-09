import { HttpException } from './http.exception';

export class TooManyRequestsException extends HttpException {
  constructor(message: string = 'Too Many Requests') {
    super(message, 429);
  }
}
