import { supabase } from '@/lib/supabase'
import { NextResponse, NextRequest } from 'next/server'

export async function pingDb(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token || token !== process.env.HEALTH_CHECK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase.from('todos').select('*').limit(1)

    return NextResponse.json(
      { message: 'Database is running' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error pinging database:', error)
    return NextResponse.json(
      { message: 'Database is not running' },
      { status: 500 },
    )
  }
}
