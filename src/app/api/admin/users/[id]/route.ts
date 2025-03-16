import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// PATCH handler to update a user's admin status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.is_admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id
    
    // Prevent users from changing their own admin status
    if (userId === session.user.id) {
      return NextResponse.json(
        { message: 'You cannot change your own admin status' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { is_admin } = body

    if (typeof is_admin !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid request data. is_admin must be a boolean.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ is_admin, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    console.error('Error in admin user update API:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || 'Failed to update user' },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { message: 'Unknown error updating user' },
        { status: 500 }
      )
    }
  }
}

// DELETE handler to delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.is_admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id
    
    // Prevent users from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { message: 'You cannot delete your own account through the admin panel' },
        { status: 400 }
      )
    }

    // Delete user's tasks first
    const { error: todosError } = await supabaseAdmin
      .from('todos')
      .delete()
      .eq('user_id', userId)

    if (todosError) {
      console.error('Error deleting user tasks:', todosError)
      throw new Error('Error deleting user tasks')
    }

    // Delete user's notifications
    const { error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (notificationsError) {
      console.error('Error deleting user notifications:', notificationsError)
      // Continue even if notifications deletion fails
    }

    // Delete the user
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error('Error deleting user:', userError)
      throw new Error('Error deleting user account')
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error in admin user delete API:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || 'Failed to delete user' },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { message: 'Unknown error deleting user' },
        { status: 500 }
      )
    }
  }
}