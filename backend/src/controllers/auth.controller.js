import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';

export const signup = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.signup(req.body), 'Account created', 201);
});

export const login = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.login(req.body), 'Logged in');
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, await authService.getCurrentUser(req.user.id));
});
