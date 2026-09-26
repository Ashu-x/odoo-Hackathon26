import { z } from 'zod';

export const uuidParamSchema = z.object({ id: z.string().uuid() });
export const idParamSchema = uuidParamSchema;
export const positiveQuantity = z.coerce.number().finite().positive().max(999999999999.999);
