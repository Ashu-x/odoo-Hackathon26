import { z } from 'zod';

export const stockMoveQuerySchema = z.object({ productId: z.string().uuid().optional(), locationId: z.string().uuid().optional(), type: z.enum(['RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'ADJUSTMENT', 'INITIAL']).optional(), from: z.string().datetime().optional(), to: z.string().datetime().optional() });
export const operationsQuerySchema = z.object({ docType: z.enum(['RECEIPT', 'DELIVERY', 'INTERNAL', 'ADJUSTMENT']).optional(), status: z.enum(['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED']).optional(), warehouseId: z.string().uuid().optional(), categoryId: z.string().uuid().optional() });
