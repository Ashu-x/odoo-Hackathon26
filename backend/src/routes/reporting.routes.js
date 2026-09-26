import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { stockMoves, kpis, operations } from '../controllers/reporting.controller.js';
import { operationsQuerySchema, stockMoveQuerySchema } from '../validators/reporting.validators.js';

const router = Router();
router.use(requireAuth);
router.get('/stock-moves', validate(stockMoveQuerySchema, 'query'), stockMoves);
router.get('/dashboard/kpis', kpis);
router.get('/dashboard/operations', validate(operationsQuerySchema, 'query'), operations);
export default router;
