// app/api/payhero/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { toast } from 'react-toastify';

const PAYHERO_API_KEY = process.env.PAYHERO_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from PayHero
    const authHeader = req.headers.get('x-api-key');
    if (authHeader !== PAYHERO_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await req.json();
    console.log('PayHero callback received:', body);

    const {
      reference,
      status,
      amount,
      phone_number,
      transaction_id,
      metadata,
      checkoutId,
    } = body;

    // Find order by payment ID or reference
    let order = await db.order.findFirst({
      where: {
        OR: [
          { paymentId: checkoutId || reference },
          { id: metadata?.orderId || '' },
        ],
      },
    });

    if (!order) {
      // If order not found, try to find by reference in order number
      order = await db.order.findFirst({
        where: {
          orderNumber: { contains: reference },
        },
      });
    }

    if (!order) {
      console.error('Order not found for callback:', { reference, checkoutId, metadata });
      return NextResponse.json({
        success: false,
        error: 'Order not found',
      }, { status: 404 });
    }

    // Update order based on payment status
    if (status === 'completed' || status === 'success') {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          mpesaTransactionId: transaction_id || checkoutId || reference,
          paidAt: new Date(),
        },
      });

      // Log the successful payment
      toast.success('Payment successful for order: ' + order.id);

      return NextResponse.json({
        success: true,
        message: 'Order updated successfully',
      });
    } else if (status === 'failed' || status === 'cancelled') {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      });

      // Log the failed payment
      

      return NextResponse.json({
        success: true,
        message: 'Order cancelled due to failed payment',
      });
    }

    // For other statuses (pending, processing, etc.)
    return NextResponse.json({
      success: true,
      message: 'Callback received',
    });

  } catch (error) {
    console.error('PayHero callback error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process callback',
    }, { status: 500 });
  }
}