import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const { user, token } = await createUser({ email, password, displayName });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully! Welcome to PluggedIN Studio.',
    });

    // Set secure auth cookie
    response.cookies.set('pluggedin_auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create account.' },
      { status: 400 }
    );
  }
}
