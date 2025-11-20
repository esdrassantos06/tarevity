import { z } from 'zod';

export const taskQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(1000)),
  limit: z
    .string()
    .optional()
    .default('6')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
  search: z
    .string()
    .optional()
    .default('')
    .transform((val) => val.trim().slice(0, 200)),
  status: z
    .enum(['ALL', 'ACTIVE', 'COMPLETED', 'REVIEW'])
    .optional()
    .default('ALL'),
  priority: z
    .enum(['ALL', 'LOW', 'MEDIUM', 'HIGH'])
    .optional()
    .default('ALL'),
  sortBy: z
    .enum(['createdAt', 'dueDate'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
