import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  resetAllUserMachines,
  revokeUserAccess,
  saveOrderRecord,
  OrderRecord,
} from '../../../../lib/auth';

const FOUNDER_EMAILS = ['dylangoodm@gmail.com', 'dylan@pluggedin.studio'];
const FOUNDER_PINS = ['8492', 'PluggedIn2026!', 'pluggedin_studio_secret_key_2026_launch'];

function isAuthorized(req: NextRequest): boolean {
  const secretHeader = req.headers.get('x-founder-secret') || req.headers.get('x-founder-pin');
  const urlPin = req.nextUrl.searchParams.get('pin');
  if (secretHeader && FOUNDER_PINS.includes(secretHeader.trim())) return true;
  if (urlPin && FOUNDER_PINS.includes(urlPin.trim())) return true;

  const token =
    req.cookies.get('pluggedin_auth_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (token) {
    const payload = verifySessionToken(token);
    if (payload && FOUNDER_EMAILS.includes(payload.email.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { action, userId, orderData } = body;

    if (action === 'reset_machines') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
      }
      const updated = await resetAllUserMachines(userId);
      return NextResponse.json({ success: true, message: `All machines successfully reset for ${updated.displayName || updated.email}`, user: updated });
    }

    if (action === 'revoke_access') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
      }
      const updated = await revokeUserAccess(userId);
      return NextResponse.json({ success: true, message: `Access revoked for ${updated.displayName || updated.email}`, user: updated });
    }

    if (action === 'test_order') {
      const dummyOrder: OrderRecord = {
        id: `ord_${Date.now()}`,
        paypalOrderId: `PAYPAL-TEST-${Date.now()}`,
        paypalCaptureId: `CAP-${Date.now()}`,
        userId: userId || 'usr_test_user',
        userEmail: orderData?.email || 'studio-producer@gmail.com',
        displayName: orderData?.name || 'Producer Metro',
        itemType: orderData?.itemType || 'perpetual_plugin',
        itemName: orderData?.itemName || 'PLUGTNE (Vocal Pitch Correction)',
        pluginId: orderData?.pluginId || 'plugtne',
        grossAmount: orderData?.gross || 79.00,
        feeAmount: orderData?.fee || 2.59,
        netAmount: orderData?.net || 76.41,
        currency: 'USD',
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      await saveOrderRecord(dummyOrder);
      return NextResponse.json({ success: true, message: 'Test order logged successfully', order: dummyOrder });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
