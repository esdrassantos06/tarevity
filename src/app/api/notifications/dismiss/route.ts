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
    const { all } = await req.json()

    if (all) {
      // Delete all notifications for this user
      const { error, count } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting all notifications:', error)
        throw error
      }

      return NextResponse.json(
        { message: 'All notifications deleted', count: count || 0 },
        { status: 200 },
      )
    } else {
      return NextResponse.json(
        { message: 'Missing all flag' },
        { status: 400 },
      )
    }
  } catch (error: unknown) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error deleting notifications',
      },
      { status: 500 },
    )
  }
}