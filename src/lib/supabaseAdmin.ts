import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing required Supabase environment variables for admin client',
  )
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'Missing Supabase environment variables for admin client. Check your .env file.',
    )
  }
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  serviceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

if (process.env.NODE_ENV === 'development') {
  ;(async function validateConnection() {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .select('count', { count: 'exact', head: true })
      if (error) {
        console.error(
          'Supabase admin client connection test failed:',
          error.message,
        )
      }
    } catch (err) {
      console.error('Failed to connect to Supabase:', err)
    }
  })()
}
