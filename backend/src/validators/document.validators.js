import { z } from 'zod';
import { idParamSchema, positiveQuantity } from './common.validators.js';

const line = z.object({ productId: z.string().uuid(), quantity: positiveQuantity });
const uniqueLines = lines => new Set(lines.map(item => item.productId)).size === lines.length;
export const receiptSchema = z.object({ supplierId: z.string().uuid(), destinationLocationId: z.string().uuid(), lines: z.array(line).min(1).refine(uniqueLines, 'Duplicate products are not allowed') });
export const deliverySchema = z.object({ customerName: z.string().trim().min(1).max(160), sourceLocationId: z.string().uuid(), lines: z.array(line).min(1).refine(uniqueLines, 'Duplicate products are not allowed') });
export const transferSchema = z.object({ sourceLocationId: z.string().uuid(), destinationLocationId: z.string().uuid(), lines: z.array(line).min(1).refine(uniqueLines, 'Duplicate products are not allowed') }).refine(value => value.sourceLocationId !== value.destinationLocationId, 'Source and destination must differ');
export const adjustmentSchema = z.object({ locationId: z.string().uuid(), lines: z.array(z.object({ productId: z.string().uuid(), countedQuantity: z.coerce.number().nonnegative() })).min(1).refine(uniqueLines, 'Duplicate products are not allowed') });
export const documentQuerySchema = z.object({ status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED']).optional(), warehouseId: z.string().uuid().optional(), categoryId: z.string().uuid().optional() });
export const documentIdSchema = idParamSchema;
