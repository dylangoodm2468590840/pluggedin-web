import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  findUserByEmail,
  createUser,
  verifyUserLogin,
  grantUserAccess,
  createSessionToken,
  saveOrderRecord,
} from '../../../../lib/auth';

const VALID_PROMO_CODES: Record<
  string,
  { tier: any; isLifetime: boolean; discountPercent: number; message: string; maxDevices?: number }
> = {
  'PLUGGED-VIP-DYLAN-8492-X9Q7': {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'VIP Access Claimed. 100% off Lifetime All-Access Pass with 5 Machine Activations.',
  },
  'PLUGGEDVIPDYLAN8492X9Q7': {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'VIP Access Claimed. 100% off Lifetime All-Access Pass with 5 Machine Activations.',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, email, password, displayName, pluginId } = body;
    const cleanCode = (code || '').trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json({ success: false, error: 'Promo code is required.' }, { status: 400 });
    }

    const match = VALID_PROMO_CODES[cleanCode];
    if (!match || match.discountPercent < 100) {
      return NextResponse.json({ success: false, error: `Invalid or unclaimable promo code "${cleanCode}".` }, { status: 400 });
    }

    let userId: string | null = null;
    let userToken: string | null = null;

    // Check existing auth token
    const token =
      req.cookies.get('pluggedin_auth_token')?.value ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        userId = session.userId;
        userToken = token;
      }
    }

    // Resolve via credentials if not authenticated
    if (!userId && email) {
      const existing = await findUserByEmail(email);
      if (existing) {
        if (password) {
          const verified = await verifyUserLogin(email, password);
          userId = verified.user.id;
          userToken = verified.token;
        } else {
          userId = existing.id;
          userToken = createSessionToken(existing.id, existing.email);
        }
      } else {
        if (!password) {
          return NextResponse.json(
            { success: false, error: 'Please choose a password to create your free account.' },
            { status: 400 }
          );
        }
        const created = await createUser({
          email,
          password,
          displayName,
        });
        userId = created.user.id;
        userToken = created.token;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User account required to claim promo code.' },
        { status: 401 }
      );
    }

    // Grant Access with lifetime VIP & 5 machines
    const updatedUser = await grantUserAccess(userId, {
      tier: match.tier,
      isLifetime: match.isLifetime,
      maxDevices: match.maxDevices || 5,
      pluginId: pluginId || undefined,
    });

    // Record promotional claim in database order log
    try {
      await saveOrderRecord({
        id: 'promo_' + userId + '_' + Date.now(),
        paypalOrderId: 'PROMO_' + cleanCode,
        userId: updatedUser.id,
        userEmail: updatedUser.email,
        displayName: updatedUser.displayName,
        itemType: 'vip_promo',
        itemName: `${match.tier} (Promo: ${cleanCode})`,
        pluginId: pluginId || undefined,
        grossAmount: 0,
        feeAmount: 0,
        netAmount: 0,
        promoCode: cleanCode,
        currency: 'USD',
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    } catch (logErr) {
      console.warn('Could not record promo claim log:', logErr);
    }

    const response = NextResponse.json({
      success: true,
      message: match.message,
      user: updatedUser,
    });

    if (userToken) {
      response.cookies.set({
        name: 'pluggedin_auth_token',
        value: userToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (err: any) {
    console.error('Promo claim error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error claiming promo code' },
      { status: 500 }
    );
  }
}
