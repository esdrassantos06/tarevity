import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextRequest } from 'next/server'

// Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const taskId = resolvedParams.id

    const { data, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('id', taskId)
      .single()

    // Check if task exists
    if (error || !data) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    // Check if the task belongs to the current user
    if (data.user_id !== userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Return the task data if authorization passes
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

// Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const taskId = resolvedParams.id

    // Parse the request body
    const updateData = await request.json()

    // Verify task belongs to user first
    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingTask) {
      console.error('Erro ao verificar tarefa:', checkError)
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    // Update the task
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

// Delete a task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const taskId = resolvedParams.id

    // Verify task belongs to user first
    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('todos')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (checkError || !existingTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 })
    }

    // Delete the task
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
