import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Busque um todo existente para usar como referência
    const { data: todoData, error: todoError } = await supabaseAdmin
      .from('todos')
      .select('id, title')
      .eq('user_id', userId)
      .limit(1)
      .single()
      
    if (todoError) {
      console.error('Erro buscando todo:', todoError)
      return NextResponse.json({ message: 'Não encontrou tarefas' }, { status: 404 })
    }
    
    // Criando uma notificação de teste usando um todo real
    const testNotification = {
      user_id: userId,
      todo_id: todoData.id,
      title: 'Teste de Notificação',
      message: `Esta é uma notificação de teste para "${todoData.title}"`,
      notification_type: 'info',
      due_date: new Date().toISOString(),
      origin_id: `test-${todoData.id}-${Date.now()}`,
      read: false,
      dismissed: false
    }
    
    // Log para debug
    console.log('Tentando criar notificação:', testNotification)
    
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(testNotification)
      .select()
      
    if (error) {
      console.error('Erro ao criar notificação de teste:', error)
      return NextResponse.json({
        message: 'Erro ao criar notificação de teste',
        error
      }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'Notificação de teste criada com sucesso',
      notification: data[0]
    })
    
  } catch (error) {
    console.error('Erro no teste de notificação:', error)
    return NextResponse.json({
      message: 'Erro ao processar teste de notificação',
      error
    }, { status: 500 })
  }
}