
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/tracking/:path*',
    '/calculator/:path*',
    '/plano/:path*',
    '/training/:path*',
    '/nutrition/:path*',
    '/prevention/:path*',
    '/glossary/:path*',
    '/overtraining/:path*',
    '/admin/:path*',
  ]
};
