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
    console.log(`Attempting to delete notifications for user ${userId}`)

    // Call the SQL function to handle deletion
    const { data, error } = await supabaseAdmin.rpc('delete_user_notifications', {
      user_id_param: userId
    })

    if (error) {
      console.error('Error deleting notifications:', error)
      throw error
    }

    const deletedCount = data || 0
    console.log(`Successfully deleted ${deletedCount} notifications`)

    return NextResponse.json(
      { 
        message: 'Notification system reset successfully',
        deletedCount 
      },
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