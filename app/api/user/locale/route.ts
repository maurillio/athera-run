import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { locales } from '@/lib/i18n/config';
import { ApiResponse, getLocaleFromRequest } from '@/lib/i18n/api-utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const requestLocale = getLocaleFromRequest(req);
    
    if (!session?.user?.email) {
      return ApiResponse.unauthorized(requestLocale);
    }

    const body = await req.json();
    const { locale } = body;

    // Validate locale
    if (!locale || !locales.includes(locale as any)) {
      return ApiResponse.error('invalidLocale', 400, requestLocale);
    }

    // Update user locale
    await prisma.user.update({
      where: { email: session.user.email },
      data: { locale },
    });

    return ApiResponse.success('localeUpdated', { locale }, locale);
  } catch (error) {
    console.error('Error updating user locale:', error);
    return ApiResponse.internalError(getLocaleFromRequest(req));
  }
}
