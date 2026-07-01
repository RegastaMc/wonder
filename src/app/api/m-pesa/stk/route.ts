import { getDarajaAccessToken } from '@/lib/mpesa'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { phone, amount } = await req.json()

  const cleanedNumber = phone.replace(/\D/g, '')
  const formattedPhone = `254${cleanedNumber.slice(-9)}`

  if (!formattedPhone) {
    return NextResponse.json(
      { message: 'Invalid phone number' },
      { status: 400 },
    )
  }

  if (!amount) {
    return NextResponse.json({ message: 'Amount is required' }, { status: 400 })
  }

  if (amount <= 0) {
    return NextResponse.json(
      { message: 'Amount must be greater than 0' },
      { status: 400 },
    )
  }

  const token = await getDarajaAccessToken()

  const date = new Date()
  const timestamp =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2)

  // const timestamp = new Date()
  //   .toISOString()
  //   .replace(/[-:.TZ]/g, "")
  //   .slice(0, 14);

  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`,
  ).toString('base64')

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'Payment',
        TransactionDesc: 'Payment via STK Push',
      }),
    },
  )

  const data = await response.json()
  // await db.mpesaTransaction.create({
  //   data: {
  //     merchantRequestId: data.MerchantRequestID,
  //     checkoutRequestId: data.CheckoutRequestID,
  //     phoneNumber: formattedPhone,
  //     amount: parseFloat(amount),
  //   },
  // });
  return NextResponse.json(data)
}
