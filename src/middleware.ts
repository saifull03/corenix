import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  userId: number;
  email: string;
  roleId: number;
  roleSlug: string;
  type: 'staff' | 'customer';
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64URL to Base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload) as JwtPayload;

    // Check expiration if present
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin and /api/admin routes
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Check staff token
  const token = request.cookies.get('corenix_token')?.value;

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Staff authentication required.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/account', request.url);
    loginUrl.searchParams.set('mode', 'login');
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'admin_access_required');
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);

  // Validate payload: must be staff and not customer
  if (!payload || payload.type !== 'staff' || payload.roleSlug === 'customer' || !payload.userId) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin / Staff role privileges required.' },
        { status: 403 }
      );
    }
    const loginUrl = new URL('/account', request.url);
    loginUrl.searchParams.set('mode', 'login');
    loginUrl.searchParams.set('error', 'unauthorized_staff_only');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
