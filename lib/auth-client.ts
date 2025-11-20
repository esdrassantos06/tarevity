import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '@/lib/auth';

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get('X-Retry-After');
        const errorMessage = retryAfter
          ? `Rate limit exceeded. Please try again after ${retryAfter} seconds.`
          : 'Too many requests. Please try again later.';
        throw new Error(errorMessage);
      }
    },
  },
});

export type Session = typeof authClient.$Infer.Session;
