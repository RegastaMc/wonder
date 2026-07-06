// app/api/payhero/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PAYHERO_API_URL = process.env.PAYHERO_API_URL || 'https://api.payhero.co.ke';
const PAYHERO_SECRET_KEY = process.env.PAYHERO_SECRET_KEY;
const PAYHERO_MERCHANT_ID = process.env.PAYHERO_MERCHANT_ID;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, email, phone, currency = 'KES', description } = body;

    // Initialize payment with PayHero
    const response = await fetch(`${PAYHERO_API_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYHERO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        merchantId: PAYHERO_MERCHANT_ID,
        amount,
        currency,
        email,
        phone,
        description,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payhero/callback`,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        paymentUrl: data.data.paymentUrl,
        checkoutId: data.data.checkoutId,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || 'Payment initialization failed',
      }, { status: 400 });
    }
  } catch (error) {
    console.error('PayHero initialization error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to initialize payment',
    }, { status: 500 });
  }
}