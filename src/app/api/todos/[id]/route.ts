import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextRequest } from 'next/server'
import { notificationsService } from '@/lib/notifications'
import { updateNotificationMessages } from '@/lib/notification-updater'

export async function GET(
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
    const taskId = id

    const { data, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('id', taskId)
      .single()

    if (error || !data) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    if (data.user_id !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching task:', error)
      return NextResponse.json(
        { message: error.message || 'Error fetching task' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error fetching task:', error)
      return NextResponse.json(
        { message: 'Unknown error fetching task' },
        { status: 500 },
      )
    }
  }
}

export async function PUT(
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
    const taskId = id

    const updateData = await request.json()

    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingTask) {
      console.error('Error checking task:', checkError)
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    // Determine if there are changes that would affect notifications
    const notificationChanges = {
      titleChanged: updateData.title && updateData.title !== existingTask.title,
      dueDateChanged:
        'due_date' in updateData &&
        updateData.due_date !== existingTask.due_date,
      completionChanged:
        'is_completed' in updateData &&
        updateData.is_completed !== existingTask.is_completed,
    }

    const { data, error } = await supabaseAdmin
      .from('todos')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    // Handle notifications based on changes
    try {
      // If task is completed, dismiss all notifications
      if (notificationChanges.completionChanged && data.is_completed) {
        await notificationsService.dismissTodoNotifications(userId, taskId)
      }
      // If due date was removed, delete all notifications
      else if (notificationChanges.dueDateChanged && !data.due_date) {
        await notificationsService.deleteNotifications({
          userId,
          todoId: taskId,
        })
      }
      // If title or due date changed, update notifications
      else if (
        (notificationChanges.titleChanged ||
          notificationChanges.dueDateChanged) &&
        data.due_date
      ) {
        // First, remove existing notifications
        await notificationsService.deleteNotifications({
          userId,
          todoId: taskId,
        })

        // Then create appropriate new ones based on current status
        const notifications =
          notificationsService.generateTodoNotifications(data)
        if (notifications.length > 0) {
          await notificationsService.processNotifications(userId, notifications)
        }
      }
      // In case task was marked as not completed, but had a due date, ensure notifications exist
      else if (
        notificationChanges.completionChanged &&
        !data.is_completed &&
        data.due_date
      ) {
        const notifications =
          notificationsService.generateTodoNotifications(data)
        if (notifications.length > 0) {
          await notificationsService.processNotifications(userId, notifications)
        }
      }
      // If nothing changed that would affect notifications but we have a due date,
      // update the message to ensure it reflects current time relative to due date
      else if (data.due_date && !data.is_completed) {
        await updateNotificationMessages(data)
      }
    } catch (error) {
      console.error('Error handling task notifications:', error)
      // Don't fail the response if notification handling fails
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating task:', error)
      return NextResponse.json(
        { message: error.message || 'Error updating task' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error updating task:', error)
      return NextResponse.json(
        { message: 'Unknown error updating task' },
        { status: 500 },
      )
    }
  }
}

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
    const taskId = id

    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('todos')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    // Delete all notifications for this task
    try {
      await notificationsService.deleteNotifications({
        userId,
        todoId: taskId,
      })
    } catch (error) {
      console.error('Error deleting task notifications:', error)
      // Don't fail the response if notification deletion fails
    }

    const { error } = await supabaseAdmin
      .from('todos')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Supabase delete error:', error)
      throw error
    }

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting task:', error)
      return NextResponse.json(
        { message: error.message || 'Error deleting task' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error deleting task:', error)
      return NextResponse.json(
        { message: 'Unknown error deleting task' },
        { status: 500 },
      )
    }
  }
}
