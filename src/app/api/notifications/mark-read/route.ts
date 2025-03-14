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
      // Mark all notifications as read
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('dismissed', false)

      if (error) {
        throw error
      }

      return NextResponse.json(
        { message: 'All notifications marked as read' },
        { status: 200 },
      )
    } else if (id) {
      // Mark specific notification as read
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return NextResponse.json(
        { message: 'Notification marked as read' },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        { message: 'Missing notification ID or all flag' },
        { status: 400 },
      )
    }
  } catch (error: unknown) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error marking notification as read',
      },
      { status: 500 },
    )
  }
}