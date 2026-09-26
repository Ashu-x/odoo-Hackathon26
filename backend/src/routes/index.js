import { Router } from 'express';
import authRouter from './auth.routes.js';
import catalogRouter from './catalog.routes.js';
import { adjustmentRouter, deliveryRouter, receiptRouter, transferRouter } from './document.routes.js';
import healthRouter from './health.routes.js';
import reportingRouter from './reporting.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/', catalogRouter);
router.use('/receipts', receiptRouter);
router.use('/delivery-orders', deliveryRouter);
router.use('/internal-transfers', transferRouter);
router.use('/stock-adjustments', adjustmentRouter);
router.use('/', reportingRouter);

export default router;
