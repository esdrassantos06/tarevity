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
    const { id, all } = await req.json()

    if (all) {
      // Dismiss all notifications
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ dismissed: true })
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return NextResponse.json(
        { message: 'All notifications dismissed' },
        { status: 200 },
      )
    } else if (id) {
      // Dismiss specific notification
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ dismissed: true })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return NextResponse.json(
        { message: 'Notification dismissed' },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        { message: 'Missing notification ID or all flag' },
        { status: 400 },
      )
    }
  } catch (error: unknown) {
    console.error('Error dismissing notification:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error dismissing notification',
      },
      { status: 500 },
    )
  }
}