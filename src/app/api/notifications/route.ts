import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isPast, isWithinInterval, addDays, parseISO } from 'date-fns'

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()

    const notifications = body.notifications

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

    const results = []
    for (const notification of notifications) {
      if (!notification.title || !notification.message || !notification.notification_type || !notification.origin_id) {
        results.push({ 
          status: 'error', 
          error: 'Missing required notification fields' 
        });
        continue;
      }

      if (!['danger', 'warning', 'info'].includes(notification.notification_type)) {
        results.push({ 
          status: 'error', 
          error: 'Invalid notification type' 
        });
        continue;
      }

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

      /**
       * Determines if a notification should be shown based on its type and due date
       * @param type The notification type (danger, warning, info)
       * @param dueDateString The due date as ISO string
       * @returns boolean indicating if the notification should be shown
       */
      function shouldShowNotification(
        type: string,
        dueDateString: string | null,
      ): boolean {
        if (!dueDateString) return false

        try {
          let dueDate: Date;
          try {
            dueDate = parseISO(dueDateString);
            
            if (isNaN(dueDate.getTime())) {
              console.error('Invalid date format:', dueDateString);
              return false;
            }
          } catch (error) {
            console.error('Error parsing date:', error);
            return false;
          }

          const now = new Date()
          const threeDaysFromNow = addDays(now, 3)

          switch (type) {
            case 'danger':
              return isPast(dueDate) && dueDate > addDays(now, -7);
            case 'warning':
              return isWithinInterval(dueDate, {
                start: now,
                end: addDays(now, 1),
              })
            case 'info':
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
        const shouldActivate = shouldShowNotification(
          notification.notification_type,
          notification.due_date,
        )

        const { data: updatedData, error: updateError } = await supabaseAdmin
          .from('notifications')
          .update({
            title: notification.title,
            message: notification.message,
            due_date: notification.due_date,
            dismissed: shouldActivate ? false : existingNotification.dismissed,
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
        const shouldCreate = shouldShowNotification(
          notification.notification_type,
          notification.due_date,
        )

        if (shouldCreate) {
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