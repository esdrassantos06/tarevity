import NextAuth from 'next-auth'
import { authOptions } from './auth-options'
import { NextRequest } from 'next/server'

export async function GET(request: Request | NextRequest) {
  // For debugging OAuth callbacks - extract from URL rather than req.query
  const url = new URL(request.url)
  if (url.pathname.includes('callback')) {
    console.log('OAuth callback - searchParams:', url.searchParams)
  }

  return await NextAuth(authOptions)(request)
}

// POST handler
export async function POST(request: Request | NextRequest) {
  return await NextAuth(authOptions)(request)
}