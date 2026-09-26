import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, role: row.role, createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function signup(input) {
  const passwordHash = await hashPassword(input.password);
  try {
    const result = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at', [input.name, input.email, passwordHash, input.role]);
    const user = publicUser(result.rows[0]);
    return { token: signToken({ id: user.id, role: user.role }), user };
  } catch (error) {
    if (error.code === '23505') throw new ApiError(409, 'Email is already registered');
    throw error;
  }
}

export async function login(input) {
  const result = await pool.query('SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1', [input.email]);
  const row = result.rows[0];
  if (!row || !(await comparePassword(input.password, row.password_hash))) throw new ApiError(401, 'Invalid email or password');
  const user = publicUser(row);
  return { token: signToken({ id: user.id, role: user.role }), user };
}

export async function getCurrentUser(userId) {
  const result = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1', [userId]);
  if (!result.rows[0]) throw new ApiError(401, 'User account not found');
  return publicUser(result.rows[0]);
}
