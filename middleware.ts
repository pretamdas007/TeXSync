import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function middleware(request: NextRequest) {
  // Skip authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  
  // Define protected routes
  const protectedRoutes = ['/editor', '/dashboard'];
  const authRoutes = ['/login', '/signup'];
  
  const path = request.nextUrl.pathname;

  // Check if path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path === route);

  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // If user is trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  // If token exists, verify it
  if (token) {
    const decoded = verifyToken(token);
    
    // If user has valid token but accesses login/signup, redirect to editor
    if (isAuthRoute && decoded) {
      return NextResponse.redirect(new URL('/editor', request.url));
    }
    
    // If token is invalid and trying to access protected route, redirect to login
    if (isProtectedRoute && !decoded) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      
      // Clear the invalid token
      const response = NextResponse.redirect(url);
      response.cookies.delete('auth_token');
      
      return response;
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/editor/:path*', '/dashboard/:path*', '/login', '/signup'],
};
