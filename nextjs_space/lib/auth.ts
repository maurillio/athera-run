
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

// Custom Strava Provider
const StravaProvider = {
  id: 'strava',
  name: 'Strava',
  type: 'oauth' as const,
  authorization: {
    url: 'https://www.strava.com/oauth/authorize',
    params: {
      scope: 'read,activity:read_all,profile:read_all',
      approval_prompt: 'auto',
      response_type: 'code',
      client_id: process.env.STRAVA_CLIENT_ID
    }
  },
  token: {
    url: 'https://www.strava.com/oauth/token',
    async request(context: any) {
      const { provider, params, checks } = context;
      
      const response = await fetch(provider.token.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: provider.clientId!,
          client_secret: provider.clientSecret!,
          code: params.code!,
          grant_type: 'authorization_code',
        })
      });
      
      return { tokens: await response.json() };
    }
  },
  userinfo: 'https://www.strava.com/api/v3/athlete',
  clientId: process.env.STRAVA_CLIENT_ID,
  clientSecret: process.env.STRAVA_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.id.toString(),
      name: `${profile.firstname} ${profile.lastname}`,
      email: profile.email || `${profile.id}@strava.user`,
      image: profile.profile || profile.profile_medium,
    };
  },
};

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
    StravaProvider as any,
  ],
  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60, // 90 days
    updateAge: 24 * 60 * 60, // Update session token daily
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Use secure flag only in production
        maxAge: 90 * 24 * 60 * 60, // 90 days
      }
    }
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

      // If signing in with Strava, save the tokens to athlete profile
      if (account?.provider === 'strava' && account.access_token) {
        try {
          const userId = user?.id || token.id as string;

          console.log('[AUTH] Processing Strava connection for user:', userId);

          // Find or create athlete profile
          let profile = await prisma.athleteProfile.findUnique({
            where: { userId }
          });

          if (!profile) {
            console.log('[AUTH] Creating new athlete profile for Strava user');
            profile = await prisma.athleteProfile.create({
              data: {
                userId,
                weight: 70,
                height: 170,
                currentVDOT: 35,
                targetTime: "4:00:00",
                goalDistance: "marathon",
                runningLevel: "intermediate",
                stravaConnected: true,
                stravaAthleteId: account.providerAccountId,
                stravaAccessToken: account.access_token,
                stravaRefreshToken: account.refresh_token || null,
                stravaTokenExpiry: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null
              }
            });
          } else {
            // Update existing profile with Strava credentials
            console.log('[AUTH] Updating existing athlete profile with Strava credentials');
            await prisma.athleteProfile.update({
              where: { id: profile.id },
              data: {
                stravaConnected: true,
                stravaAthleteId: account.providerAccountId,
                stravaAccessToken: account.access_token,
                stravaRefreshToken: account.refresh_token || null,
                stravaTokenExpiry: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null
              }
            });
          }

          token.hasProfile = true;
          console.log('[AUTH] Strava connection successful');
        } catch (error) {
          console.error('[AUTH] Error saving Strava credentials:', error);
        }
      }

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
