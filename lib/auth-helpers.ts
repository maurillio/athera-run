import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * Gets the authenticated user's ID from session
 * Always uses email lookup to ensure correct user ID
 * @returns userId or null if not authenticated
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  return user?.id || null;
}

/**
 * Gets the authenticated user from session
 * Always uses email lookup to ensure correct user data
 * @returns user object or null if not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  return user;
}

/**
 * Requires authentication and returns userId
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}
