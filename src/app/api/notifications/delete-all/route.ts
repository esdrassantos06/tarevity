import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    console.log('Attempting to delete ALL notifications from database')

    // Call the SQL function to forcefully delete all notifications
    const { data, error } = await supabaseAdmin.rpc('delete_all_notifications')

    if (error) {
      console.error('Error deleting all notifications:', error)
      throw error
    }

    const deletedCount = data || 0
    console.log(`Successfully deleted ${deletedCount} notifications`)

    return NextResponse.json(
      { 
        message: 'All notifications deleted successfully',
        deletedCount 
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error('Error deleting all notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error deleting all notifications',
      },
      { status: 500 },
    )
  }
}