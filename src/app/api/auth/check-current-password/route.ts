import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyPassword } from '@/lib/auth'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    // Validate input
    if (!token || !password) {
      console.log("Missing token or password")
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 },
      )
    }

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('user_id')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (tokenError || !tokenData) {
      console.log("Token error or no token data:", tokenError)
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 },
      )
    }

    // Create a safe cache key using a hash of the password
    // We never want to store the actual password in Redis cache
    const passwordHash = crypto
      .createHash('sha256')
      .update(`${tokenData.user_id}:${password}`)
      .digest('hex')
      
    const cacheKey = `pwd-check:${passwordHash}`
    
    // Check if this password was checked recently
    const cachedResult = await redis.get(cacheKey)
    if (cachedResult !== null) {
      return NextResponse.json(
        { isCurrentPassword: cachedResult === 'true' }, 
        { status: 200 }
      )
    }

    // Get the current user's password hash
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('password')
      .eq('id', tokenData.user_id)
      .single()

    if (userError || !userData || !userData.password) {
      return NextResponse.json(
        { message: 'User not found or has no password' },
        { status: 400 },
      )
    }

    // Check if the new password matches the current one
    const isCurrentPassword = await verifyPassword(password, userData.password)
    
    // Cache the result for 10 minutes
    // This is a security-sensitive check, so we use a short TTL
    await redis.set(cacheKey, isCurrentPassword ? 'true' : 'false', { ex: 600 })

    return NextResponse.json({ isCurrentPassword }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error checking current password:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 },
    )
  }
}