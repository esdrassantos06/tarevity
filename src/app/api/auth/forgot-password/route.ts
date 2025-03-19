import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimiter } from '@/lib/rateLimit'
import { randomBytes } from 'crypto'

function generateSecureToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous'
    const emailFragment = email ? email.slice(0, 3) : 'unknown'
    const identifier = `${ip}-${emailFragment}`

    const rateLimit = await rateLimiter(req, {
      limit: 5,
      window: 3600,
      identifier,
    })

    if (rateLimit) return rateLimit

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 },
      )
    }
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

    const resetToken = generateSecureToken()

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

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

    await sendPasswordResetEmail(user.email, resetToken)

    return NextResponse.json(
      {
        message:
          'If the email address is registered, you will receive recovery instructions',
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in forgot password API:', error)
      return NextResponse.json(
        {
          message: 'An error occurred while processing your request',
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
