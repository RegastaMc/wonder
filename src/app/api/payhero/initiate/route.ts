// app/api/payhero/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PAYHERO_API_KEY = process.env.PAYHERO_API_KEY;
const PAYHERO_API_URL = process.env.PAYHERO_API_URL || 'https://api.payhero.co.ke';
const PAYHERO_ACCOUNT_NUMBER = process.env.PAYHERO_ACCOUNT_NUMBER;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, phoneNumber, email, reference, transactionType, orderId } = body;

    // Validate required fields
    if (!amount || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Amount and phone number are required',
      }, { status: 400 });
    }

    // Prepare the request payload for PayHero
    const payload = {
      account_number: PAYHERO_ACCOUNT_NUMBER || body.accountNumber,
      amount: amount,
      phone_number: phoneNumber,
      reference: reference || `ORD-${Date.now()}`,
      transaction_type: transactionType || 'paybill',
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payhero/callback`,
      email: email || '',
      metadata: {
        orderId: orderId || '',
        userId: body.userId || '',
      },
    };

    // Make request to PayHero API
    const response = await fetch(`${PAYHERO_API_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PAYHERO_API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Update order with checkout ID if orderId is provided
      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentId: data.data.checkoutId || data.data.reference,
            paymentStatus: 'PENDING',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          checkoutId: data.data.checkoutId || data.data.reference,
          status: data.data.status || 'pending',
          message: data.message || 'Payment initiated successfully',
        },
      });
    } else {
      console.error('PayHero initiation error:', data);
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to initiate payment',
        details: data,
      }, { status: response.status || 400 });
    }

  } catch (error) {
    console.error('PayHero initiation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initiate payment. Please try again.',
    }, { status: 500 });
  }
}