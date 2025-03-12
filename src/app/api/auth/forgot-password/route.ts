import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimiter } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous'
    const emailFragment = email ? email.slice(0, 3) : 'unknown'
    const identifier = `${ip}-${emailFragment}`

    const rateLimit = await rateLimiter(req, {
      limit: 5, // 5 attempts
      window: 3600, // per hour
      identifier,
    })

    if (rateLimit) return rateLimit

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 },
      )
    }

    // Check if the user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        {
          message:
            'If the email address is registered, you will receive recovery instructions',
        },
        { status: 200 },
      )
    }

    // Generate a secure token
    const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')

    // Set expiration (1 hour from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Invalidate previous tokens for this user
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

    // Save the new token in the database
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        },
      ])

    if (tokenError) {
      console.error('Error creating reset token:', tokenError)
      throw new Error('Error generating reset token')
    }

    // Send email with the reset link
    await sendPasswordResetEmail(user.email, resetToken)

    return NextResponse.json(
      {
        message:
          'If the email address is registered, you will receive recovery instructions',
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    // Check if the error is an instance of Error
    if (error instanceof Error) {
      console.error('Error in forgot password API:', error)
      return NextResponse.json(
        {
          message:
            error.message || 'An error occurred while processing your request',
        },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in forgot password API:', error)
      return NextResponse.json(
        { message: 'An unknown error occurred' },
        { status: 500 },
      )
    }
  }
}
