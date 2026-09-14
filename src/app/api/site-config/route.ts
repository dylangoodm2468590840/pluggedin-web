import { NextRequest, NextResponse } from 'next/server';
import {
  fetchSiteConfig,
  saveSiteConfig,
  rollbackSiteConfig,
  SiteConfig,
} from '@/lib/site-config';
import { verifySessionToken } from '@/lib/auth';

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

// GET: Publicly accessible cached storefront configuration
export async function GET() {
  const config = await fetchSiteConfig();
  return NextResponse.json({
    success: true,
    config,
    cachedAt: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
    },
  });
}

// POST: Restricted to Dylan (Founder) & J.A.R.V.I.S. Guarded Modifications
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized founder operation' }, { status: 401 });
  }

  try {
    const action = req.nextUrl.searchParams.get('action');

    // Rollback action
    if (action === 'rollback' || action === 'revert') {
      const rollbackResult = await rollbackSiteConfig();
      if (!rollbackResult.success) {
        return NextResponse.json({ error: rollbackResult.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Live website successfully reverted to previous snapshot.',
        config: rollbackResult.config,
      });
    }

    const body = await req.json();
    const { updates, author } = body;

    if (!updates) {
      return NextResponse.json({ error: 'Missing updates payload' }, { status: 400 });
    }

    const result = await saveSiteConfig(updates, author || 'jarvis');
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Website configuration v${result.config.version} published to live production.`,
      config: result.config,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
