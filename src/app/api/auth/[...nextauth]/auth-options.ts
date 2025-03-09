import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { getUserByEmail, verifyPassword } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Create and export auth options configuration
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
          provider: 'credentials', // Add provider for credentials login
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
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial initialization - first login
      if (account && user) {
        if (account.provider === 'credentials') {
          return { 
            ...token, 
            id: user.id,
            provider: 'credentials' // Include provider for credentials login
          }
        }

        // For OAuth providers
        // Check if user already exists in the database
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        if (existingUser) {
          // Update existing user information
          await supabase
            .from('users')
            .update({
              name: user.name,
              image: user.image,
              provider: account.provider,
              provider_id: account.providerAccountId,
            })
            .eq('id', existingUser.id)

          return { 
            ...token, 
            id: existingUser.id,
            provider: account.provider // Include provider for OAuth
          }
        } else {
          // Create new user
          const { data: newUser } = await supabase
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

          return { 
            ...token, 
            id: newUser?.id,
            provider: account.provider // Include provider for OAuth
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        
        // Add the provider property to the user session
        if (token.provider) {
          session.user.provider = token.provider as string
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  session: {
    strategy: 'jwt' as const, // Add 'as const' to ensure type safety
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}