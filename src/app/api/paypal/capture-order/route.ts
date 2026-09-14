import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '../../../../lib/paypal';
import {
  verifySessionToken,
  findUserById,
  findUserByEmail,
  createUser,
  grantUserAccess,
  createSessionToken,
  saveOrderRecord,
} from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, plan, pluginId, accountInfo } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Capture the order via PayPal REST API
    const captureResult = await capturePayPalOrder(orderId);

    const status = captureResult.status;
    if (status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: `Payment not completed. Status: ${status}` },
        { status: 400 }
      );
    }

    // 2. Resolve User Account
    let userId: string | null = null;
    let userToken: string | null = null;

    // Check existing auth token
    const token =
      req.cookies.get('pluggedin_auth_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '');
    const session = token ? verifySessionToken(token) : null;

    if (session) {
      userId = session.userId;
      userToken = token || null;
    } else if (accountInfo && accountInfo.email && accountInfo.password) {
      // Check if account exists
      const existing = await findUserByEmail(accountInfo.email);
      if (existing) {
        userId = existing.id;
        userToken = createSessionToken(existing.id, existing.email);
      } else {
        const created = await createUser({
          email: accountInfo.email,
          password: accountInfo.password,
          displayName: accountInfo.displayName,
        });
        userId = created.user.id;
        userToken = created.token;
      }
    } else {
      // Fallback: use PayPal payer email
      const payerEmail = captureResult.payer?.email_address;
      if (payerEmail) {
        let existing = await findUserByEmail(payerEmail);
        if (!existing) {
          const created = await createUser({
            email: payerEmail,
            password: 'PluggedIn' + Math.floor(1000 + Math.random() * 9000) + '!',
            displayName: captureResult.payer?.name?.given_name || payerEmail.split('@')[0],
          });
          userId = created.user.id;
          userToken = created.token;
        } else {
          userId = existing.id;
          userToken = createSessionToken(existing.id, existing.email);
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Could not associate payment with user account' },
        { status: 400 }
      );
    }

    // 3. Grant access based on purchased item
    let updatedUser;
    if (plan === 'monthly' || plan === 'annual') {
      updatedUser = await grantUserAccess(userId, {
        tier: 'All-Access Studio Pass',
      });
    } else if (pluginId) {
      updatedUser = await grantUserAccess(userId, {
        pluginId,
      });
    } else {
      updatedUser = await grantUserAccess(userId, {
        tier: 'All-Access Studio Pass',
      });
    }

    // 4. Record order in database for Founder Dashboard
    try {
      const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
      const grossVal = parseFloat(capture?.seller_receivable_breakdown?.gross_amount?.value || capture?.amount?.value || '0');
      const feeVal = parseFloat(capture?.seller_receivable_breakdown?.paypal_fee?.value || '0');
      const netVal = parseFloat(capture?.seller_receivable_breakdown?.net_amount?.value || (grossVal - feeVal).toFixed(2));
      const captureId = capture?.id;

      await saveOrderRecord({
        id: 'ord_' + (captureId || orderId),
        paypalOrderId: orderId,
        paypalCaptureId: captureId,
        userId: updatedUser.id,
        userEmail: updatedUser.email,
        displayName: updatedUser.displayName,
        itemType: plan === 'annual' ? 'subscription_annual' : plan === 'monthly' ? 'subscription_monthly' : 'perpetual_plugin',
        itemName: pluginId ? `Perpetual License: ${pluginId}` : `All-Access Pass (${plan === 'annual' ? 'Annual' : 'Monthly'})`,
        pluginId: pluginId || undefined,
        grossAmount: grossVal,
        feeAmount: feeVal,
        netAmount: netVal,
        currency: capture?.amount?.currency_code || 'USD',
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    } catch (orderErr) {
      console.warn('Could not record order log:', orderErr);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Payment captured and license issued successfully!',
      user: updatedUser,
      orderId,
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
  } catch (error: any) {
    console.error('PayPal Capture Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to capture PayPal order' },
      { status: 500 }
    );
  }
}
