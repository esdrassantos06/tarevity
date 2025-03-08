import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Obter todas as tarefas do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Use supabaseAdmin for GET requests too, to bypass RLS consistently
    const { data, error } = await supabaseAdmin
      .from('todos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    console.error('Erro ao buscar tarefas:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao buscar tarefas' },
      { status: 500 }
    );
  }
}

// Criar nova tarefa
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Correct syntax for parsing request body
    const { title, description, priority, due_date } = await req.json();

    // Validar dados
    if (!title) {
      return NextResponse.json(
        { message: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('todos')
      .insert([
        {
          user_id: session.user.id,
          title,
          description,
          priority: priority || 1,
          due_date: due_date || null,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao criar tarefa' },
      { status: 500 }
    );
  }
}