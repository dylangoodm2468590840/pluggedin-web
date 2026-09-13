import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      );
    }

    const { token, email: verifiedEmail } = await createPasswordResetToken(email);

    // Return reset token and direct recovery link
    const resetUrl = `/account?mode=reset&token=${token}&email=${encodeURIComponent(verifiedEmail)}`;

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated successfully! You can now reset your password.',
      resetToken: token,
      resetUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process password reset.' },
      { status: 400 }
    );
  }
}
