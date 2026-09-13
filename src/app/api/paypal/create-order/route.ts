import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '../../../../lib/paypal';
import { ALL_ACCESS_MONTHLY, ALL_ACCESS_ANNUAL, PLUGINS_DATA } from '../../../../data/plugins';
import { verifySessionToken } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, pluginId, promoCode } = body;

    let amount = 0;
    let description = '';

    if (plan === 'annual') {
      amount = ALL_ACCESS_ANNUAL; // 99
      description = 'PluggedIN All-Access Studio Pass (Annual)';
    } else if (plan === 'monthly') {
      amount = ALL_ACCESS_MONTHLY; // 14.99
      description = 'PluggedIN All-Access Studio Pass (Monthly)';
    } else if (pluginId) {
      const plugin = PLUGINS_DATA.find((p) => p.id === pluginId);
      if (!plugin) {
        return NextResponse.json({ success: false, error: 'Plugin not found' }, { status: 404 });
      }
      amount = plugin.salePrice;
      description = `PluggedIN Perpetual License - ${plugin.name}`;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid checkout item' }, { status: 400 });
    }

    // Check optional promo code for partial discounts
    if (promoCode) {
      const promoLower = promoCode.trim().toUpperCase();
      if (promoLower === 'SAVE50') {
        amount = Math.round(amount * 0.5 * 100) / 100;
      }
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Free orders do not require PayPal' },
        { status: 400 }
      );
    }

    // Get user id if logged in
    const token =
      req.cookies.get('pluggedin_auth_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');
    const session = token ? verifySessionToken(token) : null;
    const customId = session ? session.userId : 'guest_' + Date.now();

    const order = await createPayPalOrder({
      amount,
      description,
      customId,
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('PayPal Create Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
