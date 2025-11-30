import { z } from 'zod';

type Translator = (
  key: string,
  params?: Record<string, string | number>,
) => string;

const pwdRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[#?!@$%^&*-]).{8,}$/;
const nameRegex = /^[A-Za-zÀ-ÿ\s'-]+$/;
const nameRegexAlt = /^[a-zA-ZÀ-ÿ\s]+$/;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export function createTaskSchema(t: Translator) {
  return z.object({
    title: z.string().min(1, t('title.required')),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.enum(['LOW', 'MEDIUM', 'HIGH']),
    ),
    status: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      z.enum(['ACTIVE', 'REVIEW', 'COMPLETED']),
    ),
  });
}

export function createSignUpSchema(t: Translator) {
  return z
    .object({
      name: z
        .string()
        .min(1, t('name.required'))
        .regex(nameRegex, {
          message: t('name.invalidFormat'),
        }),
      email: z.email(t('email.invalid')),
      password: z
        .string()
        .min(8, t('password.minLength'))
        .regex(pwdRegex, {
          message: t('password.mustContain'),
        }),
      confirmPassword: z.string().min(1, t('password.confirmRequired')),
      acceptTerms: z.boolean().refine((val) => val === true, {
        message: t('terms.mustAccept'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('password.dontMatch'),
      path: ['confirmPassword'],
    });
}

export function createSignInSchema(t: Translator) {
  return z.object({
    email: z.email(t('email.invalid')),
    password: z.string().min(8, t('password.minLength')),
    rememberMe: z.boolean().optional(),
  });
}

export function createResetPasswordSchema(t: Translator) {
  return z
    .object({
      newPassword: z
        .string()
        .min(8, t('password.minLength'))
        .max(100, t('password.maxLength')),
      confirmPassword: z.string(),
      token: z.string().min(1, t('token.required')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('password.doNotMatch'),
      path: ['confirmPassword'],
    });
}

export function createForgotPasswordSchema(t: Translator) {
  return z.object({
    email: z.email(t('email.invalid')),
  });
}

export function createUpdateUserSchema(t: Translator) {
  return z.object({
    name: z.string().min(2, t('name.minLength')).optional(),
    image: z
      .instanceof(File)
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        t('image.maxSize', { maxSize: MAX_FILE_SIZE_MB.toString() }),
      )
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        t('image.invalidFormat'),
      )
      .optional(),
  });
}

export function createAdminUpdateUserSchema(t: Translator) {
  return z.object({
    name: z
      .string()
      .min(2, t('name.minLength'))
      .max(100, t('name.maxLength') || 'Name must be less than 100 characters')
      .regex(nameRegex, {
        message: t('name.invalidFormat'),
      })
      .optional(),
    email: z.email(t('email.invalid')).optional(),
    role: z
      .enum(['user', 'admin', 'superadmin'], {
        message: t('role.invalid') || 'Invalid role',
      })
      .optional(),
  });
}

// Alternative schemas for components that use different validation messages
export function createSignUpSchemaAlt(t: Translator) {
  return z
    .object({
      name: z
        .string()
        .min(2, t('name.minLength'))
        .max(50, t('name.maxLength'))
        .regex(nameRegexAlt, {
          message: t('name.invalidFormatAlt'),
        }),
      email: z.email(t('email.invalid')),
      password: z
        .string()
        .min(8, t('password.minLength'))
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
          message: t('password.mustContainAlt'),
        }),
      confirmPassword: z
        .string()
        .min(1, t('password.passwordConfirmationRequired')),
      acceptTerms: z.boolean().refine((val) => val === true, {
        message: t('terms.mustAccept'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('password.dontMatch'),
      path: ['confirmPassword'],
    });
}

export function createSignInSchemaAlt(t: Translator) {
  return z.object({
    email: z.email(t('email.invalid')),
    password: z.string().min(1, t('password.required')),
    rememberMe: z.boolean().optional(),
  });
}

export function createResetPasswordSchemaAlt(t: Translator) {
  return z
    .object({
      newPassword: z
        .string()
        .min(8, t('password.minLength'))
        .max(100, t('password.maxLength')),
      confirmPassword: z.string().min(1, t('password.confirmRequiredAlt')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('password.doNotMatch'),
      path: ['confirmPassword'],
    });
}
