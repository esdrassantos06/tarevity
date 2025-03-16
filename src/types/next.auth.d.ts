import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      provider?: string
      is_admin?: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    provider?: string
    is_admin?: boolean
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    provider?: string
    is_admin?: boolean
  }
}
