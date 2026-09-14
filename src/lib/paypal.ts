// PayPal REST API v2 Helper
const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  'BAAUTEa1YBf_hAQZul3C8mBHiWpdOwAqYV8KammrMdLcYcpvvD-vw__gdx-_xcMHoNSIBd00VkT16JUKLg';
const PAYPAL_CLIENT_SECRET =
  process.env.PAYPAL_CLIENT_SECRET ||
  'EKisDoJrADhA7mNQz8xz0pq2CeVhxvA0mkYG7RyzN8Y91Y4zPQA868VYCoZ0TFWBegOCZNjkiMGbQruL';
const PAYPAL_ENV = process.env.PAYPAL_MODE || 'live'; // 'sandbox' | 'live'

const PAYPAL_BASE_URL =
  PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

/**
 * Retrieve OAuth2 Bearer token from PayPal
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal Client ID or Secret is not configured in .env.local');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to obtain PayPal token (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Create a PayPal v2 Order
 */
export async function createPayPalOrder(params: {
  amount: number;
  description: string;
  customId?: string;
}): Promise<{ id: string; status: string }> {
  const accessToken = await getPayPalAccessToken();

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        description: params.description,
        custom_id: params.customId || 'pluggedin_order',
        amount: {
          currency_code: 'USD',
          value: params.amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'PluggedIN Audio',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
    },
  };

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`PayPal Create Order Error (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Capture an approved PayPal Order
 */
export async function capturePayPalOrder(orderId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`PayPal Capture Order Error (${res.status}): ${errorText}`);
  }

  return await res.json();
}
