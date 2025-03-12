import NextAuth from 'next-auth/next'
import { authOptions } from './auth-options'

// This is the correct handler format for App Router
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }