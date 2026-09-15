import { NextRequest, NextResponse } from 'next/server';
import { createVipUser } from '../../../../lib/auth';

const VALID_VIP_KEYS = [
  'dylan_vip_8f9c21b3',
  'dylan-vip-exclusive-2026',
  'dylan-vip-2026',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, vipKey } = body;

    const authHeaderKey = req.headers.get('x-vip-key');
    const providedKey = (vipKey || authHeaderKey || '').trim();

    if (!providedKey || !VALID_VIP_KEYS.includes(providedKey)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing secret VIP invitation key.' },
        { status: 403 }
      );
    }

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

    const { user, token } = await createVipUser({
      email,
      password,
      displayName,
      vipSource: 'direct_vip_invite',
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: 'Lifetime VIP Studio Pass claimed successfully! Welcome to PluggedIN.',
    });

    // Set auth cookie
    response.cookies.set('pluggedin_auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to claim VIP invitation.' },
      { status: 400 }
    );
  }
}
