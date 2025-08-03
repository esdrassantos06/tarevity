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
    const { id, all, markAsUnread } = await req.json()

    const result = await notificationsService.updateReadStatus({
      id,
      userId,
      all,
      markAsUnread,
    })

    if (!result.success) {
      return NextResponse.json(
        { message: result.message || 'Missing id or all parameter' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        message: all
          ? `All notifications marked as ${markAsUnread ? 'unread' : 'read'}`
          : `Notification marked as ${markAsUnread ? 'unread' : 'read'}`,
        notification: result.notification,
        count: result.count,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error updating notification read status:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error updating notification read status',
      },
      { status: 500 },
    )
  }
}
