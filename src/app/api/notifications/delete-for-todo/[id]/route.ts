import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse, NextRequest } from 'next/server'
import { notificationsService } from '@/lib/notifications'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const todoId = id

    if (!todoId) {
      return NextResponse.json({ message: 'Missing todo ID' }, { status: 400 })
    }

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
  } catch (error) {
    console.error('Error deleting notifications for todo:', error)
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
