import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { pool } from '../config/db.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [payload.id]);
    if (!result.rows[0]) {
      throw new ApiError(401, 'User account no longer exists');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    next(new ApiError(401, error.message || 'Invalid or expired token'));
  }
}