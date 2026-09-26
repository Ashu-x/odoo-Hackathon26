import { z } from 'zod';
import { positiveQuantity, uuidParamSchema } from './common.validators.js';

const name = z.string().trim().min(1).max(120);
export const categorySchema = z.object({ name });
export const productSchema = z.object({ name, sku: z.string().trim().min(1).max(80), categoryId: z.string().uuid(), unitOfMeasure: z.string().trim().min(1).max(40), initialStock: z.object({ locationId: z.string().uuid(), quantity: positiveQuantity }).optional() });
export const productUpdateSchema = productSchema.omit({ initialStock: true }).partial();
export const reorderRuleSchema = z.object({ productId: z.string().uuid(), minQty: z.coerce.number().nonnegative(), reorderToQty: z.coerce.number().nonnegative() });
export const warehouseSchema = z.object({ name, code: z.string().trim().min(1).max(40) });
export const locationSchema = z.object({ warehouseId: z.string().uuid(), name });
export const warehouseUpdateSchema = warehouseSchema.partial();
export const locationUpdateSchema = locationSchema.omit({ warehouseId: true }).partial();
export const reorderRuleUpdateSchema = reorderRuleSchema.omit({ productId: true }).partial();
export const idParamSchema = uuidParamSchema;
export const productQuerySchema = z.object({ search: z.string().trim().optional(), categoryId: z.string().uuid().optional() });
