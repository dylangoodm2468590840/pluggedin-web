import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  findUserByEmail,
  verifyUserLogin,
  activateUserMachine,
} from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, machineId, hostname, platform, osVersion } = body;

    let userId: string | null = null;

    // Check token authentication first
    const cookieToken = req.cookies.get('pluggedin_auth_token')?.value;
    const headerToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const token = cookieToken || headerToken;

    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        userId = session.userId;
      }
    }

    // If no token or token expired, verify via email/password credentials
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

    if (!machineId && !hostname) {
      return NextResponse.json(
        { success: false, error: 'Machine identity (machineId or hostname) is required.' },
        { status: 400 }
      );
    }

    const activation = await activateUserMachine(userId, {
      machineId: machineId || hostname,
      hostname: hostname || machineId,
      platform: platform || 'win32',
      osVersion: osVersion || undefined,
    });

    if (!activation.success) {
      return NextResponse.json(
        {
          success: false,
          error: activation.error,
          machineCount: activation.machineCount,
          maxDevices: activation.maxDevices,
          user: activation.user,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: activation.user,
      machineCount: activation.machineCount,
      maxDevices: activation.maxDevices,
      licensePayload: activation.licensePayload,
    });
  } catch (err: any) {
    console.error('Device activation route error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error activating device' },
      { status: 500 }
    );
  }
}
