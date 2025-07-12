import { HttpException } from './http.exception';

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}
