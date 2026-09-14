import { NextRequest, NextResponse } from 'next/server';

const VALID_PROMO_CODES: Record<
  string,
  { tier: string; isLifetime: boolean; discountPercent: number; message: string; maxDevices?: number }
> = {
  'PLUGGED-VIP-DYLAN-8492-X9Q7': {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'VIP Access Verified. 100% off Lifetime All-Access Pass with 5 Machine Activations.',
  },
  'PLUGGEDVIPDYLAN8492X9Q7': {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'VIP Access Verified. 100% off Lifetime All-Access Pass with 5 Machine Activations.',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.code || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Promo code is required.' }, { status: 400 });
    }

    const match = VALID_PROMO_CODES[code];
    if (match) {
      return NextResponse.json({
        success: true,
        code,
        tier: match.tier,
        isLifetime: match.isLifetime,
        discountPercent: match.discountPercent,
        maxDevices: match.maxDevices || 3,
        message: match.message,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Promo code "${code}" is invalid or expired.`,
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Server error processing promo code.' }, { status: 500 });
  }
}
