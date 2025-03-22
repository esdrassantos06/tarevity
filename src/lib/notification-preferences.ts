import { supabaseAdmin } from './supabaseAdmin'

/**
 * Records user preference to not receive notifications for a specific task
 */
export async function muteNotificationsForTodo(
  userId: string,
  todoId: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          todo_id: todoId,
          muted: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,todo_id',
        },
      )

    if (error) {
      console.error('Error muting notifications:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in muteNotificationsForTodo:', error)
    return false
  }
}

/**
 * Checks if notifications for a specific task are muted
 */
export async function areNotificationsMutedForTodo(
  userId: string,
  todoId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('muted')
      .eq('user_id', userId)
      .eq('todo_id', todoId)
      .single()

    if (error) {
      // If the error is that no record exists, it's not muted
      if (error.code === 'PGRST116') {
        return false
      }
      console.error('Error checking if notifications are muted:', error)
      return false
    }

    return data?.muted || false
  } catch (error) {
    console.error('Error in areNotificationsMutedForTodo:', error)
    return false
  }
}

/**
 * Reactivates notifications for a specific task
 */
export async function unmuteNotificationsForTodo(
  userId: string,
  todoId: string,
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          todo_id: todoId,
          muted: false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,todo_id',
        },
      )

    if (error) {
      console.error('Error unmuting notifications:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in unmuteNotificationsForTodo:', error)
    return false
  }
}
