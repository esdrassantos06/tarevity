import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id, all, markAsUnread } = await req.json()

    // If handling all notifications
    if (all) {
      if (markAsUnread) {
        // Mark all as unread
        const { error, count } = await supabaseAdmin
          .from('notifications')
          .update({ read: false })
          .eq('user_id', userId)
          .eq('dismissed', false)

        if (error) {
          console.error('Error marking all notifications as unread:', error)
          throw error
        }

        return NextResponse.json(
          { 
            message: 'All notifications marked as unread', 
            count: count || 0 
          },
          { status: 200 },
        )
      } else {
        // Mark all as read
        const { error, count } = await supabaseAdmin
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId)
          .eq('dismissed', false)

        if (error) {
          console.error('Error marking all notifications as read:', error)
          throw error
        }

        return NextResponse.json(
          { 
            message: 'All notifications marked as read', 
            count: count || 0 
          },
          { status: 200 },
        )
      }
    } 
    // If handling a single notification
    else if (id) {
      // First, get the current read status
      const { data: notification, error: fetchError } = await supabaseAdmin
        .from('notifications')
        .select('read')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching notification:', fetchError);
        throw fetchError;
      }
      
      // Toggle the read status (or set to the specified value if markAsUnread is provided)
      const newReadStatus = markAsUnread !== undefined ? 
        markAsUnread === false :  // if markAsUnread is explicitly set, use opposite value
        !notification?.read;      // otherwise toggle the current value
      
      const { error, data } = await supabaseAdmin
        .from('notifications')
        .update({ read: newReadStatus })
        .eq('id', id)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Error updating notification read status:', error);
        throw error;
      }

      return NextResponse.json(
        { 
          message: `Notification marked as ${newReadStatus ? 'read' : 'unread'}`,
          notification: data?.[0]
        },
        { status: 200 },
      );
    } 
    else {
      return NextResponse.json(
        { message: 'Missing id or all parameter' },
        { status: 400 },
      )
    }
  } catch (error: unknown) {
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