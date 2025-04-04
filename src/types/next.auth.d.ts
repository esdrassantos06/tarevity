import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    error?: string
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
    refreshToken?: string
    refreshTokenExpires?: number
    refreshTokenStored?: boolean
    error?: string
    is_admin?: boolean
    iat?: number
  }
}
