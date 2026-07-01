import { Response } from 'express';
import { ApiErrorResponse, ApiSuccessResponse } from '@shared/interfaces';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string[]> | string[],
): Response<ApiErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
