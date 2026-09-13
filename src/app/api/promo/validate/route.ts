import { NextRequest, NextResponse } from 'next/server';

const VALID_PROMO_CODES: Record<string, { tier: string; isLifetime: boolean; message: string }> = {
  DYLANVIP: {
    tier: 'Pioneer Beta Tester (Lifetime)',
    isLifetime: true,
    message: 'Code DYLANVIP applied! Lifetime VIP All-Access Pass unlocked for all 15 plugins.',
  },
  HOMIEPASS: {
    tier: 'Pioneer Beta Tester (Lifetime)',
    isLifetime: true,
    message: 'Code HOMIEPASS applied! Lifetime VIP Studio Access granted.',
  },
  STUDIO100: {
    tier: 'Pioneer Beta Tester (Lifetime)',
    isLifetime: true,
    message: 'Code STUDIO100 applied! Studio All-Access Pass activated.',
  },
  PLUGCHOPFREE: {
    tier: 'Perpetual PlugChop',
    isLifetime: true,
    message: 'Code PLUGCHOPFREE applied! PlugChop 2.0 16-Pad Sampler license unlocked.',
  },
  PLUGTUNEVIP: {
    tier: 'Perpetual PlugTune',
    isLifetime: true,
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
        message: match.message,
      });
    }

    return NextResponse.json({
      success: false,
      error: `Code "${code}" is invalid or expired. Please check with Dylan or your beta invite.`,
    }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Server error processing promo code.' }, { status: 500 });
  }
}
