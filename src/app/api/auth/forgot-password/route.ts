// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // Validar input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 },
      )
    }

    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    // Por segurança, não revelamos se o usuário existe ou não
    // Isso previne ataques de enumeração de email
    if (userError || !user) {
      console.log(`Password reset requested for non-existent email: ${email}`)

      // Retornamos sucesso mesmo que o email não exista
      return NextResponse.json(
        {
          message:
            'Se o endereço de email estiver cadastrado, você receberá as instruções de recuperação',
        },
        { status: 200 },
      )
    }

    // Gerar um token seguro
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Definir expiração (1 hora a partir de agora)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Invalidar tokens anteriores para este usuário
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

    // Salvar o novo token no banco de dados
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        },
      ])

    if (tokenError) {
      console.error('Error creating reset token:', tokenError)
      throw new Error('Erro ao gerar token de redefinição')
    }

    // Enviar email com o link de redefinição
    await sendPasswordResetEmail(user.email, resetToken)

    return NextResponse.json(
      {
        message:
          'Se o endereço de email estiver cadastrado, você receberá as instruções de recuperação',
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    // Verificar se o erro é uma instância de Error
    if (error instanceof Error) {
      console.error('Error in forgot password API:', error)
      return NextResponse.json(
        {
          message:
            error.message || 'Ocorreu um erro ao processar sua solicitação',
        },
        { status: 500 },
      )
    } else {
      console.error('Unknown error in forgot password API:', error)
      return NextResponse.json(
        { message: 'Ocorreu um erro desconhecido' },
        { status: 500 },
      )
    }
  }
}
