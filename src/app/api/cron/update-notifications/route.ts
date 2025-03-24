import { NextResponse } from 'next/server'
import { notificationUpdateService } from '@/lib/notification-update-service'

// This route is designed to be called by a scheduled job service
// like Upstash QStash or a similar service that can trigger API endpoints
// at scheduled intervals (e.g., once per day at midnight)

export async function POST(req: Request) {
  try {
    // Optional: Check for authorization header to secure this endpoint
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && (!authHeader || !authHeader.includes(cronSecret))) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      )
    }
    
    // Run the notification update service
    const result = await notificationUpdateService.updateAllNotifications()
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.message, updates: 0 },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: result.message,
      updates: result.updates,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in notification update cron job:', error)
    
    return NextResponse.json(
      { 
        message: error instanceof Error 
          ? error.message 
          : 'Unknown error updating notifications',
        error: true
      },
      { status: 500 }
    )
  }
}

// Also allow GET requests for manual triggering or health checks
export async function GET() {
  return NextResponse.json({
    status: 'Notification update service is available. Use POST to trigger updates.',
    time: new Date().toISOString()
  })
}