import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import * as service from '../services/document.service.js';

export const list = type => asyncHandler(async (req, res) => sendSuccess(res, await service.list(type, req.query)));
export const get = type => asyncHandler(async (req, res) => sendSuccess(res, await service.get(type, req.params.id)));
export const create = type => asyncHandler(async (req, res) => sendSuccess(res, await service.create(type, req.body, req.user.id), 'Document created', 201));
export const update = type => asyncHandler(async (req, res) => sendSuccess(res, await service.update(type, req.params.id, req.body)));
export const validate = type => asyncHandler(async (req, res) => sendSuccess(res, await service.validate(type, req.params.id, req.user.id), 'Document validated'));
export const cancel = type => asyncHandler(async (req, res) => sendSuccess(res, await service.cancel(type, req.params.id), 'Document cancelled'));
export const pick = asyncHandler(async (req, res) => sendSuccess(res, await service.transition('delivery', req.params.id, 'DRAFT', 'WAITING')));
export const pack = asyncHandler(async (req, res) => sendSuccess(res, await service.transition('delivery', req.params.id, 'WAITING', 'READY')));
