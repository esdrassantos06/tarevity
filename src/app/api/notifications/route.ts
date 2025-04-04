import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextRequest, NextResponse } from 'next/server'
import { notificationsService } from '@/lib/notifications'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const notifications =
      await notificationsService.getUserNotifications(userId)

    return NextResponse.json(notifications, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error fetching notifications',
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const body = await req.json()

    const notifications = body.notifications

    if (!Array.isArray(notifications)) {
      console.error(
        'Invalid notifications format: notifications must be an array',
        notifications,
      )
      return NextResponse.json(
        {
          message:
            'Invalid notifications format: notifications must be an array',
        },
        { status: 400 },
      )
    }

    for (const notification of notifications) {
      if (
        !notification.todo_id ||
        !notification.title ||
        !notification.message ||
        !notification.notification_type ||
        !notification.due_date ||
        !notification.origin_id
      ) {
        console.error('Notifications API: Incomplete data', notification)
      }
    }

    const results = await notificationsService.processNotifications(
      userId,
      notifications,
    )

    return NextResponse.json(
      { message: 'Notifications processed successfully', results },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error('Notifications API: Error processing notifications', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error processing notifications',
      },
      { status: 500 },
    )
  }
}
