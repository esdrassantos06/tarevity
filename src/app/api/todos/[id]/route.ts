import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextRequest } from 'next/server'

// Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Extract the task ID from URL parameters
    const taskId = resolvedParams.id

    // Log for debugging
    console.log(`Fetching task with ID: ${taskId} for user: ${session.user.id}`)

    const { data, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching task:', error)
      return NextResponse.json(
        { message: error.message || 'Erro ao buscar tarefa' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error fetching task:', error)
      return NextResponse.json(
        { message: 'Erro desconhecido ao buscar tarefa' },
        { status: 500 },
      )
    }
  }
}

// Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Extract the task ID from URL parameters
    const taskId = resolvedParams.id

    // Parse the request body
    const updateData = await request.json()

    // Log for debugging
    console.log(`Updating task with ID: ${taskId}`, updateData)

    // Verify task belongs to user first
    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('todos')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', session.user.id)
      .single()

    if (checkError || !existingTask) {
      return NextResponse.json(
        { message: 'Tarefa não encontrada' },
        { status: 404 },
      )
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
        { message: error.message || 'Erro ao atualizar tarefa' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error updating task:', error)
      return NextResponse.json(
        { message: 'Erro desconhecido ao atualizar tarefa' },
        { status: 500 },
      )
    }
  }
}

// Delete a task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    // Extract the task ID from URL parameters
    const taskId = resolvedParams.id

    // Log for debugging
    console.log(`Deleting task with ID: ${taskId} for user: ${session.user.id}`)

    // Verify task belongs to user first
    const { data: existingTask, error: checkError } = await supabaseAdmin
      .from('todos')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', session.user.id)
      .single()

    if (checkError || !existingTask) {
      return NextResponse.json(
        { message: 'Tarefa não encontrada' },
        { status: 404 },
      )
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
      { message: 'Tarefa excluída com sucesso' },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting task:', error)
      return NextResponse.json(
        { message: error.message || 'Erro ao excluir tarefa' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error deleting task:', error)
      return NextResponse.json(
        { message: 'Erro desconhecido ao excluir tarefa' },
        { status: 500 },
      )
    }
  }
}