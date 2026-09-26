import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as controller from '../controllers/document.controller.js';
import { adjustmentSchema, deliverySchema, documentIdSchema, documentQuerySchema, receiptSchema, transferSchema } from '../validators/document.validators.js';

function documentRouter(type, schema, options = {}) {
  const router = Router();
  router.use(requireAuth);
  router.get('/', validate(documentQuerySchema, 'query'), controller.list(type));
  router.post('/', validate(schema), controller.create(type));
  router.get('/:id', validate(documentIdSchema, 'params'), controller.get(type));
  if (options.editable) {
    router.put('/:id', validate(documentIdSchema, 'params'), validate(schema), controller.update(type));
  }
  router.post('/:id/validate', validate(documentIdSchema, 'params'), controller.validate(type));
  router.post('/:id/cancel', validate(documentIdSchema, 'params'), controller.cancel(type));

  return router;
}

export const receiptRouter = documentRouter('receipt', receiptSchema, { editable: true });
export const deliveryRouter = documentRouter('delivery', deliverySchema, { editable: true });
export const transferRouter = documentRouter('transfer', transferSchema);
export const adjustmentRouter = documentRouter('adjustment', adjustmentSchema);