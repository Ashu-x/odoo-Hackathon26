import { ApiError } from '../utils/ApiError.js';

export function errorHandler(error, req, res, next) {
  const isKnownError = error instanceof ApiError;
  if (!isKnownError) console.error(error);

  const statusCode = isKnownError ? error.statusCode : 500;
  const response = {
    success: false,
    message: isKnownError ? error.message : 'Internal server error',
  };
  if (isKnownError && error.details) response.errors = error.details;
  res.status(statusCode).json(response);
}
