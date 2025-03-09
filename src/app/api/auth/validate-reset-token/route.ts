import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: Request) {
 try {
   const url = new URL(req.url)
   const token = url.searchParams.get('token')

   if (!token) {
     return NextResponse.json(
       { message: 'Token not provided' },
       { status: 400 },
     )
   }

   // Find the token in the database
   const { data, error } = await supabaseAdmin
     .from('password_reset_tokens')
     .select('*')
     .eq('token', token)
     .eq('used', false)
     .single()

   if (error || !data) {
     return NextResponse.json(
       { message: 'Invalid or expired token' },
       { status: 400 },
     )
   }

   // Check if the token has expired
   const expiresAt = new Date(data.expires_at)
   const now = new Date()

   if (now > expiresAt) {
     // Mark the token as used since it expired
     await supabaseAdmin
       .from('password_reset_tokens')
       .update({ used: true })
       .eq('id', data.id)

     return NextResponse.json({ message: 'Token expired' }, { status: 400 })
   }

   return NextResponse.json(
     { message: 'Valid token', userId: data.user_id },
     { status: 200 },
   )
 } catch (error: unknown) {
   if (error instanceof Error) {
     console.error('Error validating reset token:', error)
     return NextResponse.json(
       { message: error.message || 'Error validating token' },
       { status: 500 },
     )
   } else {
     console.error('Unknown error validating reset token:', error)
     return NextResponse.json(
       { message: 'Unknown error validating token' },
       { status: 500 },
     )
   }
 }
}