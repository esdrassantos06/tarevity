import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string;
      provider?: string;
    } & DefaultSession['user']
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string;
    provider?: string;
  }
}

// Extending the JWT object to include provider
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    provider?: string;
  }
}