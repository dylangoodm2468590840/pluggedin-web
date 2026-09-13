import { NextRequest, NextResponse } from 'next/server';
import { verifyUserLogin } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { user, token } = await verifyUserLogin(email, password);

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Signed in successfully!',
    });

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
      { success: false, error: error.message || 'Login failed.' },
      { status: 401 }
    );
  }
}
