
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Let NextAuth handle the request
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow access to public pages
        const publicPaths = ['/login', '/signup', '/'];
        const pathname = req.nextUrl.pathname;
        
        // Always allow API routes (including auth callbacks)
        if (pathname.startsWith('/api/')) {
          return true;
        }
        
        // Check for locale prefix and extract actual path
        const pathWithoutLocale = pathname.replace(/^\/(pt-BR|en|es)/, '') || '/';
        
        if (publicPaths.includes(pathWithoutLocale)) {
          return true;
        }
        
        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
