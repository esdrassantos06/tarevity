import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { getUserByEmail, verifyPassword } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

declare module 'next-auth' {
  interface Session {
    error?: string
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      provider?: string
      is_admin?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    provider?: string
    refreshToken?: string
    refreshTokenExpires?: number
    refreshTokenStored?: boolean
    error?: string
  }
}

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
          is_admin: user.is_admin || false,
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
        domain:
          process.env.NODE_ENV === 'production' ? '.tarevity.pt' : undefined,
      },
    },
  },
  callbacks: {
    async signIn() {
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/dashboard')) {
        return url
      }

      if (url.includes('/auth')) {
        return `${baseUrl}/dashboard`
      }

      if (url.startsWith(baseUrl)) {
        return url
      }

      return `${baseUrl}/dashboard`
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.provider = token.provider
        session.user.is_admin = token.is_admin || false
      }

      if (token.error === 'RefreshTokenError') {
        session.error = 'RefreshTokenError'
      }

      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === 'credentials') {
          return {
            ...token,
            id: user.id,
            provider: 'credentials',
            is_admin: user.is_admin || false,
            refreshToken: crypto.randomBytes(32).toString('hex'),
            refreshTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
          }
        }

        try {
          const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single()

          if (findError && findError.code !== 'PGRST116') {
            console.error('Error finding user:', findError)
            return {
              ...token,
              id: user.id,
              provider: account.provider,
              refreshToken: crypto.randomBytes(32).toString('hex'),
              refreshTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            }
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

            const refreshToken = crypto.randomBytes(32).toString('hex')
            const refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000

            await supabase.from('refresh_tokens').insert({
              user_id: existingUser.id,
              token: refreshToken,
              expires_at: new Date(refreshTokenExpires).toISOString(),
            })

            return {
              ...token,
              id: existingUser.id,
              provider: account.provider,
              is_admin: existingUser.is_admin || false,
              refreshToken: refreshToken,
              refreshTokenExpires: refreshTokenExpires,
              refreshTokenStored: true,
            }
          } else {
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
              return {
                ...token,
                id: user.id,
                provider: account.provider,
                refreshToken: crypto.randomBytes(32).toString('hex'),
                refreshTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
              }
            }

            const refreshToken = crypto.randomBytes(32).toString('hex')
            const refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000

            if (newUser) {
              await supabase.from('refresh_tokens').insert({
                user_id: newUser.id,
                token: refreshToken,
                expires_at: new Date(refreshTokenExpires).toISOString(),
              })
            }

            return {
              ...token,
              id: newUser?.id || user.id,
              provider: account.provider,
              refreshToken: refreshToken,
              refreshTokenExpires: refreshTokenExpires,
              refreshTokenStored: true,
            }
          }
        } catch (error) {
          console.error('Unexpected error in JWT callback:', error)
          return {
            ...token,
            id: user.id,
            provider: account.provider,
            refreshToken: crypto.randomBytes(32).toString('hex'),
            refreshTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
          }
        }
      }

      if (token.refreshToken && !account && !user) {
        const shouldRefresh = Date.now() > Number(token.exp) * 1000
        if (shouldRefresh) {
          try {
            const { data, error } = await supabase
              .from('refresh_tokens')
              .select('*')
              .eq('token', token.refreshToken)
              .eq('user_id', token.id)
              .single()

            if (
              error ||
              !data ||
              new Date(data.expires_at).getTime() < Date.now()
            ) {
              return { ...token, error: 'RefreshTokenError' }
            }

            const newRefreshToken = crypto.randomBytes(32).toString('hex')

            await supabase
              .from('refresh_tokens')
              .delete()
              .eq('token', token.refreshToken)
            await supabase.from('refresh_tokens').insert({
              user_id: token.id,
              token: newRefreshToken,
              expires_at: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            })

            return {
              ...token,
              refreshToken: newRefreshToken,
              refreshTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000,
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
            }
          } catch (error) {
            console.error('Error refreshing token:', error)
            return { ...token, error: 'RefreshTokenError' }
          }
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
