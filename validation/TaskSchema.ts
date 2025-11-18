import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { createTaskSchema } from './schemas';

// For server-side usage
export async function getTaskSchema(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Validation' });
  return createTaskSchema(t);
}

// Legacy export - kept for backward compatibility but should use getTaskSchema instead
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['ACTIVE', 'REVIEW', 'COMPLETED']).default('ACTIVE'),
});

export type TaskInput = z.infer<typeof taskSchema>;
