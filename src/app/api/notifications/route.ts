import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isPast, isWithinInterval, addDays } from 'date-fns'

// GET notifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id


    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }


    return NextResponse.json(data || [], { status: 200 })
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

// Create or update notification
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()


    // Check if we have notifications property in the body
    const notifications = body.notifications

    // Check if notifications is an array
    if (!Array.isArray(notifications)) {
      console.error('Invalid notifications format: not an array', notifications)
      return NextResponse.json(
        {
          message:
            'Invalid notifications format: notifications must be an array',
        },
        { status: 400 },
      )
    }


    // Process each notification
    const results = []
    for (const notification of notifications) {
      // Add user_id to the notification object
      const notificationWithUserId = {
        ...notification,
        user_id: userId,
      }


      const { data: existingNotification, error: findError } =
        await supabaseAdmin
          .from('notifications')
          .select('id, dismissed, read')
          .eq('user_id', userId)
          .eq('origin_id', notification.origin_id)
          .single()

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding notification:', findError)
      }

      // Helper function to determine if a notification should be shown based on its type and due date
      function shouldShowNotification(
        type: string,
        dueDateString: string | null,
      ): boolean {
        if (!dueDateString) return false

        try {
          const now = new Date()
          const dueDate = new Date(dueDateString)
          const threeDaysFromNow = new Date(now)
          threeDaysFromNow.setDate(now.getDate() + 3)

          switch (type) {
            case 'danger':
              // Show danger (overdue) notifications if the due date is in the past
              return isPast(dueDate)
            case 'warning':
              // Show warning notifications if due within 24 hours
              return isWithinInterval(dueDate, {
                start: now,
                end: addDays(now, 1),
              })
            case 'info':
              // Show info notifications if due within 3 days but not within 24 hours
              return isWithinInterval(dueDate, {
                start: addDays(now, 1),
                end: threeDaysFromNow,
              })
            default:
              return false
          }
        } catch (error) {
          console.error('Error checking notification date:', error)
          return false
        }
      }

      if (existingNotification) {

        // Determine if we should re-activate this notification based on its type and due date
        const shouldActivate = shouldShowNotification(
          notification.notification_type,
          notification.due_date,
        )

        // Update existing notification
        const { data: updatedData, error: updateError } = await supabaseAdmin
          .from('notifications')
          .update({
            title: notification.title,
            message: notification.message,
            due_date: notification.due_date,
            // Reset dismissed state if notification should be re-activated
            dismissed: shouldActivate ? false : existingNotification.dismissed,
            // Don't update the read status - preserve it
          })
          .eq('id', existingNotification.id)
          .select()

        if (updateError) {
          console.error('Error updating notification:', updateError)
          results.push({ status: 'error', error: updateError })
        } else {
          results.push({ status: 'updated', notification: updatedData })
        }
      } else {

        // For new notifications, check if we should create it based on type and due date
        const shouldCreate = shouldShowNotification(
          notification.notification_type,
          notification.due_date,
        );

        // Only create if it should be active
        if (shouldCreate) {
          // Create new notification
          const { data: insertedData, error: insertError } = await supabaseAdmin
          .from('notifications')
          .insert([notificationWithUserId])
          .select()

          if (insertError) {
            console.error('Error creating notification:', insertError)
            results.push({ status: 'error', error: insertError })
          } else {
            results.push({ status: 'created', notification: insertedData })
          }
        } else {
          results.push({
            status: 'skipped',
            message: 'Not relevant based on due date',
          })
        }
      }
    }

    return NextResponse.json(
      { message: 'Notifications processed successfully', results },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error('Error processing notifications:', error)
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
