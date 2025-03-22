import { NextRequest, NextResponse } from 'next/server'
import {
  processDynamicNotificationUpdates,
  createMissingNotifications,
} from '@/lib/notification-updater'

// Secret token to authenticate cron requests
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  try {
    // Security check - verify the request has the correct secret
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.split(' ')[1]

    if (!CRON_SECRET || token !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      )
    }

    // Process notifications
    const updatedCount = await processDynamicNotificationUpdates()
    const createdCount = await createMissingNotifications()

    return NextResponse.json(
      {
        success: true,
        updated: updatedCount,
        created: createdCount,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error in notifications cron job:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Error processing notifications update',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
