
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Usuário não encontrado');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Senha incorreta');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // Nota: Strava OAuth é manipulado via /api/strava/auth e /api/strava/callback
    // em vez de usar o NextAuth provider para evitar conflitos de Schema do Prisma
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[AUTH] SignIn attempt:', {
        provider: account?.provider,
        userId: user?.id,
        email: user?.email
      });

      // For Strava, ensure we have an email (even if fake)
      if (account?.provider === 'strava' && !user.email) {
        user.email = `${account.providerAccountId}@strava.user`;
        console.log('[AUTH] Generated email for Strava user:', user.email);
      }

      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;

        // Check if user is admin
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isAdmin: true, athleteProfile: true }
        });
        token.isAdmin = dbUser?.isAdmin || false;
        token.hasProfile = !!dbUser?.athleteProfile;
      }

      // Nota: Strava é manipulado via /api/strava/callback, não pelo NextAuth JWT callback
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[AUTH] Redirect:', { url, baseUrl });

      // If it's a callback URL, check if user needs onboarding
      if (url.includes('/api/auth/callback')) {
        // For now, always go to dashboard after OAuth login
        // The dashboard will handle redirecting to onboarding if needed
        return baseUrl + '/dashboard';
      }

      // If URL is provided and starts with base URL, use it
      if (url.startsWith(baseUrl)) return url;

      // If URL is a relative path, append to base URL
      if (url.startsWith('/')) return baseUrl + url;

      // Default to dashboard
      return baseUrl + '/dashboard';
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('[AUTH] User signed in:', {
        userId: user.id,
        provider: account?.provider,
        isNewUser,
        email: user.email
      });
    },
    async signOut({ token }) {
      console.log('[AUTH] User signed out:', token?.id);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
