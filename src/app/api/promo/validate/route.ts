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
    message: 'Master VIP Code Verified! 100% off Lifetime All-Access Pass with 5 Machine Activations.',
  },
  'PLUGGEDVIPDYLAN8492X9Q7': {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'Master VIP Code Verified! 100% off Lifetime All-Access Pass with 5 Machine Activations.',
  },
  DYLANVIP: {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'Code DYLANVIP applied! 100% off All-Access Studio Pass unlocked.',
  },
  HOMIEPASS: {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'Code HOMIEPASS applied! 100% off Studio Access granted.',
  },
  FRIENDS100: {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'Friends & Family Code applied! 100% off All-Access Pass.',
  },
  STUDIO100: {
    tier: 'All-Access Studio Pass',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 5,
    message: 'Code STUDIO100 applied! 100% off All-Access Pass activated.',
  },
  PLUGCHOPFREE: {
    tier: 'Perpetual PlugChop',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 3,
    message: 'Code PLUGCHOPFREE applied! PlugChop 2.0 16-Pad Sampler license unlocked.',
  },
  PLUGTUNEVIP: {
    tier: 'Perpetual PlugTune',
    isLifetime: true,
    discountPercent: 100,
    maxDevices: 3,
    message: 'Code PLUGTUNEVIP applied! PLUGTNE AutoTune Suite license unlocked.',
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
