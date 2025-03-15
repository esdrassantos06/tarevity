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
    const { todoId } = await req.json()

    if (!todoId) {
      return NextResponse.json(
        { message: 'Missing todo ID' },
        { status: 400 }
      )
    }

    // Mark all notifications for this todo as dismissed
    const { error, count } = await supabaseAdmin
      .from('notifications')
      .update({ dismissed: true })
      .eq('user_id', userId)
      .eq('todo_id', todoId)

    if (error) {
      console.error('Error dismissing notifications:', error)
      throw error
    }

    return NextResponse.json(
      { 
        message: 'Notifications for todo dismissed',
        count: count || 0
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error dismissing notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error dismissing notifications',
      },
      { status: 500 }
    )
  }
}