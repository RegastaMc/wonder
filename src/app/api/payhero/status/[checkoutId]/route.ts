// app/api/payhero/status/[checkoutId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PAYHERO_API_KEY = process.env.PAYHERO_API_KEY;
const PAYHERO_API_URL = process.env.PAYHERO_API_URL || 'https://api.payhero.co.ke';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const { checkoutId } = await params;

    if (!checkoutId) {
      return NextResponse.json({
        success: false,
        error: 'Checkout ID is required',
      }, { status: 400 });
    }

    // Query PayHero for payment status
    const response = await fetch(`${PAYHERO_API_URL}/payments/status/${checkoutId}`, {
      method: 'GET',
      headers: {
        'x-api-key': PAYHERO_API_KEY!,
      },
    });

    const data = await response.json();

    if (response.ok) {
      // If payment is successful, update order status
      if (data.status === 'completed' || data.status === 'success') {
        // Find order by payment ID
        const order = await db.order.findFirst({
          where: {
            mpesaTransactionId: checkoutId,
          },
        });

        if (order && order.paymentStatus !== 'PAID') {
          await db.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        status: data.status || data.data?.status || 'pending',
        data: data.data || data,
      });
    } else {
      console.error('PayHero status check error:', data);
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: data.message || 'Failed to check payment status',
      }, { status: response.status || 400 });
    }

  } catch (error) {
    console.error('PayHero status check error:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      error: 'Failed to check payment status',
    }, { status: 500 });
  }
}