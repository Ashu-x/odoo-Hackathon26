import { z } from 'zod';

const password = z.string().min(8).max(128);
const role = z.enum(['INVENTORY_MANAGER', 'WAREHOUSE_STAFF']);

export const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  password,
  role,
});

export const loginSchema = z.object({
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  password,
});
