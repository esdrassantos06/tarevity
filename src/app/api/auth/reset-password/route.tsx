import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 },
      )
    }

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('expires_at, user_id, id')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 },
      )
    }

    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      await supabaseAdmin
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', tokenData.id)

      return NextResponse.json({ message: 'Token expired' }, { status: 400 })
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('password')
      .eq('id', tokenData.user_id)
      .single()

    if (userError || !userData || !userData.password) {
      return NextResponse.json({ message: 'User not found' }, { status: 400 })
    }

    const isCurrentPassword = await verifyPassword(password, userData.password)
    if (isCurrentPassword) {
      return NextResponse.json(
        { message: 'New password cannot be the same as your current password' },
        { status: 400 },
      )
    }

    const hashedPassword = await hashPassword(password)

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenData.user_id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      throw new Error('Failed to update password')
    }

    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id)

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in reset password API:', error)
      return NextResponse.json(
        {
          message:
            error.message || 'An error occurred while resetting the password',
        },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in reset password API:', error)
      return NextResponse.json(
        { message: 'An unknown error occurred while resetting the password' },
        { status: 500 },
      )
    }
  }
}
