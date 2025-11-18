import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from './prisma';
import { admin } from 'better-auth/plugins';
import { hashPassword, verifyPassword } from './argon2';
import { nextCookies } from 'better-auth/next-js';
import { redis } from './redis';
import { sendEmail } from './email';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${url}</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    github: {
      prompt: 'select_account consent',
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scopes: [`read:user`, `user:email`],
    },
    google: {
      prompt: 'select_account consent',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    },
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin', 'superadmin'],
    }),
    nextCookies(),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 2 * 60,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'secondary-storage',
  },
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | 'UNKNOWN';
