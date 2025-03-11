import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { redis } from '@/lib/redis'

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

   // Check token validation status in cache first
   const cacheKey = `reset-token:${token}`
   const cachedResult = await redis.get(cacheKey)
   
   if (cachedResult) {
     const data = JSON.parse(cachedResult as string)
     
     // If the token was valid and not expired in our cache
     if (data.valid) {
       return NextResponse.json(
         { message: 'Valid token', userId: data.userId },
         { status: 200 },
       )
     } else {
       // If the token was invalid or expired in our cache
       return NextResponse.json(
         { message: data.message || 'Invalid token' },
         { status: 400 },
       )
     }
   }

   // Not in cache, find the token in the database
   const { data, error } = await supabaseAdmin
     .from('password_reset_tokens')
     .select('*')
     .eq('token', token)
     .eq('used', false)
     .single()

   if (error || !data) {
     // Cache the invalid token result for 1 hour to prevent brute force attacks
     await redis.set(
       cacheKey,
       JSON.stringify({ 
         valid: false, 
         message: 'Invalid or expired token' 
       }),
       { ex: 3600 }
     )
     
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

     // Cache the expired token result for 1 hour
     await redis.set(
       cacheKey,
       JSON.stringify({ 
         valid: false, 
         message: 'Token expired' 
       }),
       { ex: 3600 }
     )
     
     return NextResponse.json({ message: 'Token expired' }, { status: 400 })
   }

   // Cache the valid token for 5 minutes (we don't want to cache it too long for security)
   await redis.set(
     cacheKey,
     JSON.stringify({ 
       valid: true, 
       userId: data.user_id 
     }),
     { ex: 300 }
   )

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