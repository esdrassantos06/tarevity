import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextRequest, NextResponse } from 'next/server'
import { notificationsService } from '@/lib/notifications'
import { muteNotificationsForTodo } from '@/lib/notification-preferences'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id, all, todoId } = await req.json()

    if (id) {
      const { data: notification, error: fetchError } =
        await notificationsService.fetchNotification(id, userId)

      if (fetchError) {
        return NextResponse.json(
          { message: fetchError.message || 'Error fetching notification' },
          { status: 500 },
        )
      }

      if (!notification) {
        return NextResponse.json(
          { message: 'Notification not found' },
          { status: 404 },
        )
      }

      await muteNotificationsForTodo(userId, notification.todo_id)

      await notificationsService.deleteNotifications({
        id,
        userId,
      })

      return NextResponse.json(
        {
          message: 'Notification deleted successfully',
          count: 1,
        },
        { status: 200 },
      )
    } else if (todoId) {
      await muteNotificationsForTodo(userId, todoId)

      const result = await notificationsService.deleteNotifications({
        userId,
        todoId,
      })

      return NextResponse.json(
        {
          message: 'Notifications for todo deleted',
          count: result.count || 0,
        },
        { status: 200 },
      )
    } else if (all) {
      const result = await notificationsService.deleteNotifications({
        userId,
        all: true,
      })

      return NextResponse.json(
        {
          message: 'All notifications deleted',
          count: result.count || 0,
        },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { message: 'Missing id, todoId, or all parameter' },
      { status: 400 },
    )
  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error deleting notifications',
      },
      { status: 500 },
    )
  }
}
