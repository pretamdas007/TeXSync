import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { headers } from 'next/headers';

// Dynamically import prisma to avoid build-time issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET() {
  try {
    // Check if we're in build mode
    if (process.env.NODE_ENV === 'development' && !headers) {
      return NextResponse.json({ error: 'Build mode' }, { status: 503 });
    }

    const headersList = await headers();
    const authorization = headersList.get('Authorization') || '';

    if (!authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.substring(7);
    const decoded = verifyToken(token);    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const prisma = await getPrisma();

    const session = await prisma.session.findFirst({
      where: {
        token,
        userId: decoded.userId,
        expires: { gt: new Date() },
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in me route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
