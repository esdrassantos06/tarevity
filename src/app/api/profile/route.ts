import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in profile API:', error)
      return NextResponse.json(
        { message: error.message || 'Erro ao buscar perfil' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in profile API:', error)
      return NextResponse.json(
        { message: 'Erro desconhecido ao buscar perfil' },
        { status: 500 },
      )
    }
  }
}

// Update user profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const updateData = await req.json()

    // Validate data
    if (!updateData.name?.trim()) {
      return NextResponse.json(
        { message: 'Nome é obrigatório' },
        { status: 400 },
      )
    }

    // Update the user profile
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        name: updateData.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in profile update API:', error)
      return NextResponse.json(
        { message: error.message || 'Erro ao atualizar perfil' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in profile update API:', error)
      return NextResponse.json(
        { message: 'Erro desconhecido ao atualizar perfil' },
        { status: 500 },
      )
    }
  }
}
