import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error resetting notifications:', error)
      throw error
    }

    return NextResponse.json(
      { message: 'Notification system reset successfully' },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error('Error resetting notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error resetting notifications',
      },
      { status: 500 },
    )
  }
}