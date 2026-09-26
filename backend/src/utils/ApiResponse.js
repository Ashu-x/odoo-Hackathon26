export function successResponse(data, message) {
  return { success: true, data, ...(message ? { message } : {}) };
}

export function sendSuccess(res, data, message, statusCode = 200) {
  return res.status(statusCode).json(successResponse(data, message));
}
