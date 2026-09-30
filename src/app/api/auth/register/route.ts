import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();
    const password = (body.password || '').toString();
    const confirmPassword = (body.confirmPassword || '').toString();

    // 1. Validations
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide your full name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!phone || phone.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid contact phone number.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match. Please re-enter.' },
        { status: 400 }
      );
    }

    // 2. Check if email exists in customers or users
    const existingCustEmail = await queryOne<any>(
      `SELECT id FROM customers WHERE LOWER(email) = ?`,
      [email]
    );
    if (existingCustEmail) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const existingUserEmail = await queryOne<any>(
      `SELECT id FROM users WHERE LOWER(email) = ?`,
      [email]
    );
    if (existingUserEmail) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered in the system. Please sign in.' },
        { status: 409 }
      );
    }

    // 3. Check if phone exists in customers
    const existingCustPhone = await queryOne<any>(
      `SELECT id FROM customers WHERE phone = ?`,
      [phone]
    );
    if (existingCustPhone) {
      return NextResponse.json(
        { success: false, error: 'An account with this phone number already exists.' },
        { status: 409 }
      );
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Insert new Customer
    const insertResult = await query<any>(
      `INSERT INTO customers (
        name, email, phone, password_hash, is_verified, reward_points, status
      ) VALUES (?, ?, ?, ?, 1, 50, 'active')`,
      [name, email, phone, passwordHash]
    );

    const newCustomerId = (insertResult as any).insertId;

    // 6. Sign auth token & set cookies
    const token = signToken({
      userId: newCustomerId,
      email: email,
      roleId: 0,
      roleSlug: 'customer',
      branchId: null,
      type: 'customer',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to CORENIX (50 Welcome Points Added).',
      userType: 'customer',
      redirect: '/',
      user: {
        id: newCustomerId,
        name,
        email,
        phone,
        reward_points: 50,
      },
    });

    response.cookies.set('corenix_token', token, cookieOptions);
    response.cookies.set('corenix_cust_token', token, cookieOptions);

    return response;
  } catch (error: any) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account. Please try again later.' },
      { status: 500 }
    );
  }
}
