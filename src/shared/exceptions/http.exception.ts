export class HttpException extends Error {
  message: string;
  statusCode: number;
  success: boolean;

  constructor(message: string, statusCode: number, success: boolean = false) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.success = success;

    Error.captureStackTrace(this, this.constructor);
  }
}
