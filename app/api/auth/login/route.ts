import { NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';

// Dynamically import prisma to avoid build-time issues
async function getPrisma() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function POST(request: Request) {
  try {
    // Check if we're in build mode
    if (process.env.NODE_ENV === 'development' && !request.url) {
      return NextResponse.json({ error: 'Build mode' }, { status: 503 });
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare password
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({ userId: user.id });

    // Delete any existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    // Create new session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token
    });
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
