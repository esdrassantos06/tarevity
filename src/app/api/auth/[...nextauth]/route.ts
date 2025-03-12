import NextAuth from 'next-auth'
import { authOptions } from './auth-options'
import { NextApiRequest, NextApiResponse } from 'next'


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Add debugging for OAuth callbacks
  if (req.query && req.query.nextauth && req.query.nextauth.includes('callback')) {
    console.log('OAuth callback - query:', req.query)
  }
  
  return await NextAuth(req, res, authOptions)
}

export { handler as GET, handler as POST }