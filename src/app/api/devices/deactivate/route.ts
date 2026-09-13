import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  findUserByEmail,
  verifyUserLogin,
  deactivateUserMachine,
} from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, machineId, hostname } = body;

    let userId: string | null = null;

    // Check token authentication
    const cookieToken = req.cookies.get('pluggedin_auth_token')?.value;
    const headerToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const token = cookieToken || headerToken;

    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        userId = session.userId;
      }
    }

    if (!userId && email && password) {
      try {
        const loginRes = await verifyUserLogin(email, password);
        userId = loginRes.user.id;
      } catch (authErr: any) {
        return NextResponse.json(
          { success: false, error: authErr.message || 'Authentication failed' },
          { status: 401 }
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const targetId = (machineId || hostname || '').trim();
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'Machine ID or hostname is required to deactivate.' },
        { status: 400 }
      );
    }

    const result = await deactivateUserMachine(userId, targetId);

    return NextResponse.json({
      success: true,
      message: `Machine "${targetId}" successfully deactivated.`,
      user: result.user,
      machineCount: result.machineCount,
      maxDevices: result.maxDevices,
    });
  } catch (err: any) {
    console.error('Device deactivation route error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error deactivating device' },
      { status: 500 }
    );
  }
}
