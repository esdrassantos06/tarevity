import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextRequest, NextResponse } from 'next/server'
import { notificationsService } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { todoId } = await req.json()

    if (!todoId) {
      return NextResponse.json({ message: 'Missing todo ID' }, { status: 400 })
    }

    const result = await notificationsService.dismissTodoNotifications(
      userId,
      todoId,
    )

    return NextResponse.json(
      {
        message: 'Notifications for todo dismissed',
        count: result.count,
      },
      { status: 200 },
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
      { status: 500 },
    )
  }
}
