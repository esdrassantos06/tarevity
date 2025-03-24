import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { notificationsService } from '@/lib/notifications'
import { formatDistanceToNow, differenceInDays } from 'date-fns'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // 1. Get all active todos for the user with due dates
    const { data: todos, error: todosError } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .not('due_date', 'is', null)
    
    if (todosError) {
      console.error('Error fetching todos for notification refresh:', todosError)
      return NextResponse.json(
        { message: 'Error fetching tasks' },
        { status: 500 }
      )
    }

    // 2. Generate updated notifications for each todo
    const notificationsToProcess = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const todo of todos) {
      if (!todo.due_date) continue
      
      const dueDate = new Date(todo.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      const diffDays = differenceInDays(dueDate, today)
      const isPastDue = diffDays < 0
      
      // Create appropriate notifications based on date
      if (isPastDue) {
        // Overdue task
        notificationsToProcess.push({
          todo_id: todo.id,
          notification_type: 'danger',
          title: 'Overdue Task',
          message: `"${todo.title}" is overdue by ${formatDistanceToNow(dueDate)}`,
          due_date: todo.due_date,
          origin_id: `danger-${todo.id}`,
        })
      } else if (diffDays === 0) {
        // Due today
        notificationsToProcess.push({
          todo_id: todo.id,
          notification_type: 'danger',
          title: 'Due Today',
          message: `"${todo.title}" is due today`,
          due_date: todo.due_date,
          origin_id: `danger-${todo.id}`,
        })
      } else if (diffDays === 1) {
        // Due tomorrow
        notificationsToProcess.push({
          todo_id: todo.id,
          notification_type: 'warning',
          title: 'Due Tomorrow',
          message: `"${todo.title}" is due tomorrow`,
          due_date: todo.due_date,
          origin_id: `warning-${todo.id}`,
        })
      } else if (diffDays >= 2 && diffDays <= 4) {
        // Coming up in next few days
        notificationsToProcess.push({
          todo_id: todo.id,
          notification_type: 'info',
          title: 'Upcoming Deadline',
          message: `"${todo.title}" is due in ${diffDays} days`,
          due_date: todo.due_date,
          origin_id: `info-${todo.id}`,
        })
      }
    }

    // 3. Process the notifications
    if (notificationsToProcess.length > 0) {
      const results = await notificationsService.processNotifications(
        userId,
        notificationsToProcess
      )

      return NextResponse.json(
        { 
          message: 'Notifications refreshed successfully',
          count: notificationsToProcess.length,
          results 
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'No notifications to refresh' },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error refreshing notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error refreshing notifications',
      },
      { status: 500 }
    )
  }
}