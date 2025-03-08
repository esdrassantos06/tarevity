import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';

// Obter uma tarefa específica
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Tarefa não encontrada' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao buscar tarefa:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao buscar tarefa' },
      { status: 500 }
    );
  }
}

// Atualizar uma tarefa
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { title, description, is_completed, priority, due_date } = await req.json();

    // Validar dados
    if (!title) {
      return NextResponse.json(
        { message: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a tarefa pertence ao usuário
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !todo) {
      return NextResponse.json(
        { message: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('todos')
      .update({
        title,
        description,
        is_completed: is_completed !== undefined ? is_completed : false,
        priority: priority || 1,
        due_date: due_date || null,
      })
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
  }
}

// Excluir uma tarefa
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se a tarefa pertence ao usuário
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !todo) {
      return NextResponse.json(
        { message: 'Tarefa não encontrada' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Tarefa excluída com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir tarefa:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao excluir tarefa' },
      { status: 500 }
    );
  }
}