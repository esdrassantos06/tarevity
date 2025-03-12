import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { getUserByEmail, verifyPassword } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const cookiePrefix = process.env.NODE_ENV === 'production' ? '__Secure-' : ''

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email)
        if (!user || !user.password) {
          return null
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password,
        )
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          provider: 'credentials',
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
  ],
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Make sure the domain setting is correct for your production environment
        domain: process.env.NODE_ENV === 'production' ? '.tarevity.pt' : undefined,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? `__Host-next-auth.csrf-token`
          : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn() {
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // If this is a callback URL, don't modify it
      if (url.includes('/api/auth/callback')) {
        return url;
      }
      
      // If URL already points to dashboard, keep it
      if (url.includes('/dashboard')) {
        return url;
      }
    
      // If URL is an auth page, redirect to dashboard
      if (url.includes('/auth')) {
        return `${baseUrl}/dashboard`;
      }
    
      // If URL is within our domain, keep it
      if (url.startsWith(baseUrl)) {
        return url;
      }
    
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === 'credentials') {
          return { ...token, id: user.id, provider: 'credentials' }
        }
    
        try {
          const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()
          
          if (findError && findError.code !== 'PGRST116') {
            console.error('Error finding user:', findError)
            // Return a valid token even if DB operations fail
            return { ...token, id: user.id, provider: account.provider }
          }
    
          if (existingUser) {
            const { error: updateError } = await supabase
              .from('users')
              .update({
                name: user.name,
                image: user.image,
                provider: account.provider,
                provider_id: account.providerAccountId,
              })
              .eq('id', existingUser.id)
            
            if (updateError) {
              console.error('Error updating user:', updateError)
            }
    
            return { ...token, id: existingUser.id, provider: account.provider }
          } else {
            // Create new user
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  provider: account.provider,
                  provider_id: account.providerAccountId,
                },
              ])
              .select()
              .single()
            
            if (insertError) {
              console.error('Error creating user:', insertError)
              // Return a valid token even if user creation fails
              return { ...token, id: user.id, provider: account.provider }
            }
    
            return { ...token, id: newUser?.id || user.id, provider: account.provider }
          }
        } catch (error) {
          console.error('Unexpected error in JWT callback:', error)
          // Fallback to ensure a valid token is returned
          return { ...token, id: user.id, provider: account.provider }
        }
      }
    
      return token
    },
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
