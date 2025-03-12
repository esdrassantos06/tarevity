import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get total tasks count
    const { count: totalCount, error: totalError } = await supabaseAdmin
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (totalError) {
      throw totalError
    }

    // Get completed tasks count
    const { count: completedCount, error: completedError } = await supabaseAdmin
      .from('todos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true)

    if (completedError) {
      throw completedError
    }

    // Calculate pending tasks
    const pendingCount = (totalCount || 0) - (completedCount || 0)

    return NextResponse.json(
      {
        total: totalCount || 0,
        completed: completedCount || 0,
        pending: pendingCount,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching user stats:', error)
      return NextResponse.json(
        { message: error.message || 'Error fetching statistics' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error fetching user stats:', error)
      return NextResponse.json(
        { message: 'Unknown error fetching statistics' },
        { status: 500 },
      )
    }
  }
}