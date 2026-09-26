import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import * as service from '../services/reporting.service.js';

export const stockMoves = asyncHandler(async (req, res) => sendSuccess(res, await service.listStockMoves(req.query)));
export const kpis = asyncHandler(async (req, res) => sendSuccess(res, await service.getKpis()));
export const operations = asyncHandler(async (req, res) => sendSuccess(res, await service.listOperations(req.query)));
