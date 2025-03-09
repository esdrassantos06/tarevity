import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Validar input
    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Buscar o token no banco de dados
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o token expirou
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      // Marcar o token como usado
      await supabaseAdmin
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      return NextResponse.json(
        { message: 'Token expirado' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(password);

    // Atualizar a senha do usuário
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw new Error('Falha ao atualizar senha');
    }

    // Marcar o token como usado
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in reset password API:', error);
    return NextResponse.json(
      { message: error.message || 'Ocorreu um erro ao redefinir a senha' },
      { status: 500 }
    );
  }
}