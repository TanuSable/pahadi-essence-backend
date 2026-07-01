import { HTTP_STATUS } from '@shared/constants';

export const getDefaultErrorMessage = (statusCode: number): string => {
  const messages: Record<number, string> = {
    [HTTP_STATUS.BAD_REQUEST]: 'Bad request',
    [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
    [HTTP_STATUS.FORBIDDEN]: 'Forbidden',
    [HTTP_STATUS.NOT_FOUND]: 'Resource not found',
    [HTTP_STATUS.CONFLICT]: 'Conflict',
    [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Validation failed',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal server error',
  };

  return messages[statusCode] ?? 'An unexpected error occurred';
};
