import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { createSignUpSchema } from './schemas';

// For server-side usage
export async function getSignUpSchema(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Validation' });
  return createSignUpSchema(t);
}

// Legacy export - kept for backward compatibility but should use getSignUpSchema instead
const pwdRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/;
const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;

export const signUpSchema = z
  .object({
    name: z.string().min(1, 'Please enter your name').regex(nameRegex, {
      message:
        'Name must contain only letters, spaces, apostrophes, or hyphens',
    }),
    email: z.email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(pwdRegex, {
        message:
          'Must contain uppercase, lowercase, number and special character',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
