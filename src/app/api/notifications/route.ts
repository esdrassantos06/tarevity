import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { notificationsService } from '@/lib/notifications'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const notifications = await notificationsService.getUserNotifications(userId)

    return NextResponse.json(notifications, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error fetching notifications',
      },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log('API Notificações: Usuário não autenticado');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`API Notificações: Processando para usuário ${userId}`);
    
    const body = await req.json()
    console.log('API Notificações: Corpo da requisição recebido', JSON.stringify(body, null, 2));

    const notifications = body.notifications

    if (!Array.isArray(notifications)) {
      console.error('API Notificações: Formato inválido - não é um array', notifications)
      return NextResponse.json(
        {
          message:
            'Invalid notifications format: notifications must be an array',
        },
        { status: 400 },
      )
    }

    console.log(`API Notificações: Processando ${notifications.length} notificações`);
    
    // Validação adicional antes de processar
    for (const notification of notifications) {
      if (!notification.todo_id || !notification.title || !notification.message || 
          !notification.notification_type || !notification.due_date || !notification.origin_id) {
        console.error('API Notificações: Dados de notificação incompletos', notification);
      }
    }

    const results = await notificationsService.processNotifications(userId, notifications)
    console.log('API Notificações: Resultados do processamento', JSON.stringify(results, null, 2));

    // Verificar os resultados para identificar problemas
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;
    const created = results.filter(r => r.status === 'created').length;
    const updated = results.filter(r => r.status === 'updated').length;
    
    console.log(`API Notificações: Estatísticas - Criadas: ${created}, Atualizadas: ${updated}, Ignoradas: ${skipped}, Erros: ${errors}`);

    return NextResponse.json(
      { message: 'Notifications processed successfully', results },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error('API Notificações: Erro ao processar notificações', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error processing notifications',
      },
      { status: 500 },
    )
  }
}