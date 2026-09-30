import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully.',
    redirect: '/account',
  });

  // Clear all auth cookies
  response.cookies.set('corenix_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set('corenix_cust_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function GET() {
  return POST();
}
