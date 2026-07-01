export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]> | string[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string[]> | string[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
