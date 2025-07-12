import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not found') {
    super(message, 404);
  }
}
