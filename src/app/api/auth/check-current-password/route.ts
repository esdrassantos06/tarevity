import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
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
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 },
      )
    }

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

    const isCurrentPassword = await verifyPassword(password, userData.password)

    return NextResponse.json({ isCurrentPassword }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error checking current password:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 },
    )
  }
}
