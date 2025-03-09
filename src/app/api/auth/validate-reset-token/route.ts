import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 400 }
      );
    }

    // Buscar o token no banco de dados
    const { data, error } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o token expirou
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      // Marcar o token como usado, já que expirou
      await supabaseAdmin
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', data.id);

      return NextResponse.json(
        { message: 'Token expirado' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Token válido', userId: data.user_id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { message: 'Erro ao validar token' },
      { status: 500 }
    );
  }
}