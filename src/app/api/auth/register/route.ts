import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validar dados
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Dados incompletos' },
        { status: 400 },
      )
    }

    // Verificar se usuário já existe
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já cadastrado' },
        { status: 400 },
      )
    }

    // Criar novo usuário
    const newUser = await createUser(name, email, password)

    return NextResponse.json(
      { message: 'Usuário registrado com sucesso', user: { id: newUser.id } },
      { status: 201 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao registrar usuário:', error)
      return NextResponse.json(
        { message: error.message || 'Erro ao processar o registro' },
        { status: 500 },
      )
    } else {
      console.error('Erro desconhecido ao registrar usuário:', error)
      return NextResponse.json(
        { message: 'Erro desconhecido ao processar o registro' },
        { status: 500 },
      )
    }
  }
}
