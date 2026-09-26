import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
