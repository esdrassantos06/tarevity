import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import {
  processDynamicNotificationUpdates,
  createMissingNotifications,
} from '@/lib/notification-updater'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await processDynamicNotificationUpdates()
    await createMissingNotifications()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    console.error('Error refreshing notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error refreshing notifications',
      },
      { status: 500 },
    )
  }
}
