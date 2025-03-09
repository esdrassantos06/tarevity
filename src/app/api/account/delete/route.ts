import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Start a transaction to ensure all deletions succeed or fail together
    // Since Supabase JS client doesn't directly support transactions,
    // we'll do this in sequential steps with careful error handling

    console.log(`Deleting account for user ID: ${userId}`)

    // Step 1: Delete all todos belonging to the user
    console.log(`Deleting todos for user ID: ${userId}`)
    const { error: todosError } = await supabaseAdmin
      .from('todos')
      .delete()
      .eq('user_id', userId)

    if (todosError) {
      console.error('Error deleting user todos:', todosError)
      throw new Error('Erro ao excluir tarefas do usuário')
    }

    // Step 2: Delete any other user-related data (add more as needed)
    // For example, if you have user settings or other related tables

    // Step 3: Delete the user account
    console.log(`Deleting user account with ID: ${userId}`)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (userError) {
      console.error('Error deleting user account:', userError)
      throw new Error('Erro ao excluir conta do usuário')
    }

    console.log(`Successfully deleted account for user ID: ${userId}`)

    return NextResponse.json(
      { message: 'Conta excluída com sucesso' },
      { status: 200 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in account deletion:', error)
      return NextResponse.json(
        { message: error.message || 'Erro ao excluir conta' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in account deletion:', error)
      return NextResponse.json(
        { message: 'Erro desconhecido ao excluir conta' },
        { status: 500 },
      )
    }
  }
}
