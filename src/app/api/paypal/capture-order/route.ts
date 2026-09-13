import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '../../../../lib/paypal';
import {
  verifySessionToken,
  findUserById,
  findUserByEmail,
  createUser,
  grantUserAccess,
  createSessionToken,
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
