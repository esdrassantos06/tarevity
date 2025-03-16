import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET handler to fetch system statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.is_admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (usersError) {
      console.error('Error fetching user count:', usersError)
      throw usersError
    }

    // Get active users (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: activeUsers, error: activeUsersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('updated_at', thirtyDaysAgo.toISOString())

    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError)
      throw activeUsersError
    }

    // Get total tasks count
    const { count: totalTasks, error: tasksError } = await supabaseAdmin
      .from('todos')
      .select('*', { count: 'exact', head: true })

    if (tasksError) {
      console.error('Error fetching task count:', tasksError)
      throw tasksError
    }

    // Get completed tasks count
    const { count: completedTasks, error: completedTasksError } = await supabaseAdmin
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)

    if (completedTasksError) {
      console.error('Error fetching completed tasks:', completedTasksError)
      throw completedTasksError
    }

    // Calculate pending tasks
    const pendingTasks = (totalTasks || 0) - (completedTasks || 0)

    // Assemble the stats object
    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      pendingTasks: pendingTasks,
    }

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching admin stats:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || 'Failed to fetch stats' },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { message: 'Unknown error fetching stats' },
        { status: 500 }
      )
    }
  }
}