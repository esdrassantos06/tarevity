import z from 'zod';
import { getTranslations } from 'next-intl/server';
import { createUpdateUserSchema } from './schemas';

// For server-side usage
export async function getUpdateUserSchema(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Validation' });
  return createUpdateUserSchema(t);
}

// Legacy export - kept for backward compatibility but should use getUpdateUserSchema instead
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `Maximum file size is ${MAX_FILE_SIZE_MB}MB.`,
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Invalid image format. Only JPG, PNG, WEBP or GIF.',
    )
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
