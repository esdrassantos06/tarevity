import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { all } = await req.json()

    if (all) {
      const { error, count } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        throw error
      }

      return NextResponse.json(
        { 
          message: 'All notifications marked as read', 
          count: count || 0 
        },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        { message: 'Missing all flag' },
        { status: 400 },
      )
    }
  } catch (error: unknown) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error marking notifications as read',
      },
      { status: 500 },
    )
  }
}