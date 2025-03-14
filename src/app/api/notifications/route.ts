import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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
    const { notifications } = await req.json()

    // Check if notifications is an array
    if (!Array.isArray(notifications)) {
      return NextResponse.json(
        { message: 'Invalid notifications format' },
        { status: 400 },
      )
    }

    // Process each notification
    for (const notification of notifications) {
      // Check if notification with this origin_id already exists
      const { data: existingNotification, error: findError } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('origin_id', notification.origin_id)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding notification:', findError)
      }

      if (existingNotification) {
        // Update existing notification
        const { error: updateError } = await supabaseAdmin
          .from('notifications')
          .update({
            title: notification.title,
            message: notification.message,
            due_date: notification.due_date,
            // Don't update the read status - preserve it
          })
          .eq('id', existingNotification.id)

        if (updateError) {
          console.error('Error updating notification:', updateError)
        }
      } else {
        // Create new notification
        const { error: insertError } = await supabaseAdmin
          .from('notifications')
          .insert([
            {
              user_id: userId,
              todo_id: notification.todo_id,
              notification_type: notification.type,
              title: notification.title,
              message: notification.message,
              due_date: notification.due_date,
              origin_id: notification.origin_id
            },
          ])

        if (insertError) {
          console.error('Error creating notification:', insertError)
        }
      }
    }

    return NextResponse.json(
      { message: 'Notifications processed successfully' },
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