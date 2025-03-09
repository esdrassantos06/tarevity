import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token e senha são obrigatórios' },
        { status: 400 },
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 422 },
      )
    }

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso' },
      { status: 200 },
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in reset password API:', error.message)
      return NextResponse.json(
        { message: 'Ocorreu um erro ao redefinir a senha' },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in reset password API:', error)
      return NextResponse.json(
        { message: 'Ocorreu um erro desconhecido ao redefinir a senha' },
        { status: 500 },
      )
    }
  }
}
