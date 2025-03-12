import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE() {
 try {
   // Get the authenticated user's session
   const session = await getServerSession(authOptions)

   if (!session?.user?.id) {
     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
   }

   const userId = session.user.id

   // Start a transaction to ensure all deletions succeed or fail together
   // Since Supabase JS client doesn't directly support transactions,
   // we'll do this in sequential steps with careful error handling

   // Step 1: Delete all todos belonging to the user
   const { error: todosError } = await supabaseAdmin
     .from('todos')
     .delete()
     .eq('user_id', userId)

   if (todosError) {
     throw new Error('Error deleting user tasks')
   }

   // Step 2: Delete the user record
   const { error: userError } = await supabaseAdmin
     .from('users')
     .delete()
     .eq('id', userId)

   if (userError) {
     throw new Error('Error deleting user account')
   }

   return NextResponse.json(
     { message: 'Account deleted successfully' },
     { status: 200 },
   )
 } catch (error: unknown) {
   if (error instanceof Error) {
     return NextResponse.json(
       { message: error.message || 'Error deleting account' },
       { status: 500 },
     )
   } else {
     return NextResponse.json(
       { message: 'Unknown error deleting account' },
       { status: 500 },
     )
   }
 }
}