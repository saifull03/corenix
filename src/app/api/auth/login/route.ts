import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body.identifier || body.email || body.emailOrPhone || '').toString().trim();
    const password = (body.password || '').toString();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your email or phone number and password.' },
        { status: 400 }
      );
    }

    // 1. First, check if this is an Admin / Staff user in the `users` table
    const staffUser = await queryOne<any>(
      `SELECT u.id, u.name, u.email, u.phone, u.password_hash, u.role_id, u.branch_id, u.status, u.avatar,
              r.name as role_name, r.slug as role_slug,
              b.name as branch_name, b.code as branch_code
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE (LOWER(u.email) = LOWER(?) OR u.phone = ?) AND u.status = 'active'`,
      [identifier, identifier]
    );

    if (staffUser) {
      const isMatch = await bcrypt.compare(password, staffUser.password_hash);
      if (isMatch) {
        const token = signToken({
          userId: staffUser.id,
          email: staffUser.email,
          roleId: staffUser.role_id,
          roleSlug: staffUser.role_slug,
          branchId: staffUser.branch_id,
          type: 'staff',
        });

        const response = NextResponse.json({
          success: true,
          message: `Welcome back, ${staffUser.name}! Directing to Admin Dashboard...`,
          userType: 'staff',
          redirect: '/admin',
          user: {
            id: staffUser.id,
            name: staffUser.name,
            email: staffUser.email,
            phone: staffUser.phone,
            role_slug: staffUser.role_slug,
            role_name: staffUser.role_name,
            branch_code: staffUser.branch_code,
            branch_name: staffUser.branch_name,
          },
        });

        // Set staff auth cookie (7 days)
        response.cookies.set('corenix_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });

        // Clear any old customer cookie
        response.cookies.set('corenix_cust_token', '', {
          httpOnly: true,
          path: '/',
          maxAge: 0,
        });

        await logAudit({
          userId: staffUser.id,
          userName: staffUser.name,
          roleName: staffUser.role_name,
          module: 'auth',
          action: 'login_staff',
          newData: { email: staffUser.email, role: staffUser.role_slug },
        });

        return response;
      }
    }

    // 2. Second, check if this is a Customer in the `customers` table
    const customer = await queryOne<any>(
      `SELECT id, name, email, phone, password_hash, is_verified, reward_points, status
       FROM customers
       WHERE (LOWER(email) = LOWER(?) OR phone = ?) AND status = 'active'`,
      [identifier, identifier]
    );

    if (customer) {
      const isMatch = await bcrypt.compare(password, customer.password_hash);
      if (isMatch) {
        const token = signToken({
          userId: customer.id,
          email: customer.email,
          roleId: 0,
          roleSlug: 'customer',
          branchId: null,
          type: 'customer',
        });

        const response = NextResponse.json({
          success: true,
          message: `Welcome back, ${customer.name}! Directing to CORENIX Storefront...`,
          userType: 'customer',
          redirect: '/',
          user: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            reward_points: customer.reward_points,
          },
        });

        // Set both cookies so customer works seamlessly across all services
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        };

        response.cookies.set('corenix_token', token, cookieOptions);
        response.cookies.set('corenix_cust_token', token, cookieOptions);

        return response;
      }
    }

    // 3. Neither staff nor customer matched credentials
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid credentials. Please verify your email/phone and password.',
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Unified login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
