import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { notificationsService } from '@/lib/notifications'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id, all } = await req.json()

    const result = await notificationsService.deleteNotifications({
      id,
      userId,
      all,
    })

    if (!result.success) {
      return NextResponse.json(
        { message: result.message || 'Missing id or all parameter' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        message: id
          ? 'Notification deleted successfully'
          : 'All notifications deleted',
        count: result.count,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
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
