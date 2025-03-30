import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { message: 'Token not provided' },
        { status: 400 },
      )
    }

    const { data, error } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('expires_at, user_id, id')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 },
      )
    }

    const expiresAt = new Date(data.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      await supabaseAdmin
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', data.id)

      return NextResponse.json({ message: 'Token expired' }, { status: 400 })
    }

    return NextResponse.json(
      { message: 'Valid token', userId: data.user_id },
      { status: 200 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error validating reset token:', error)
      return NextResponse.json(
        { message: error.message || 'Error validating token' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error validating reset token:', error)
      return NextResponse.json(
        { message: 'Unknown error validating token' },
        { status: 500 },
      )
    }
  }
}
