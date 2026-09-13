import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, findUserById, toSafeProfile } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get('pluggedin_auth_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: toSafeProfile(user) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
