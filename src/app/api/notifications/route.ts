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

    // For debugging, log the user ID
    console.log('Fetching notifications for user:', userId);

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

    // Log how many notifications were found
    console.log(`Found ${data?.length || 0} notifications for user ${userId}`);

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
    
    // Log what we received from the client
    console.log('Received notification request:', { userId, body });
    
    // Check if we have notifications property in the body
    const notifications = body.notifications;
    
    // Check if notifications is an array
    if (!Array.isArray(notifications)) {
      console.error('Invalid notifications format: not an array', notifications);
      return NextResponse.json(
        { message: 'Invalid notifications format: notifications must be an array' },
        { status: 400 },
      )
    }

    console.log(`Processing ${notifications.length} notifications for user ${userId}`);

    // Process each notification
    const results = [];
    for (const notification of notifications) {
      // Add user_id to the notification object
      const notificationWithUserId = {
        ...notification,
        user_id: userId
      };
      
      // Check if notification with this origin_id already exists
      console.log(`Checking for existing notification with origin_id: ${notification.origin_id}`);
      
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
        console.log(`Updating existing notification: ${existingNotification.id}`);
        
        // Update existing notification
        const { data: updatedData, error: updateError } = await supabaseAdmin
          .from('notifications')
          .update({
            title: notification.title,
            message: notification.message,
            due_date: notification.due_date,
            // Don't update the read status - preserve it
          })
          .eq('id', existingNotification.id)
          .select()

        if (updateError) {
          console.error('Error updating notification:', updateError)
          results.push({ status: 'error', error: updateError });
        } else {
          results.push({ status: 'updated', notification: updatedData });
        }
      } else {
        console.log('Creating new notification:', notificationWithUserId);
        
        // Create new notification
        const { data: insertedData, error: insertError } = await supabaseAdmin
          .from('notifications')
          .insert([notificationWithUserId])
          .select()

        if (insertError) {
          console.error('Error creating notification:', insertError)
          results.push({ status: 'error', error: insertError });
        } else {
          results.push({ status: 'created', notification: insertedData });
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