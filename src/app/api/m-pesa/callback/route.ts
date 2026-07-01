// import { db } from "@/shared/lib/db";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const body = await req.json();

//   const callback = body.Body.stkCallback;

//   const metadata = callback.CallbackMetadata?.Item || [];

//   const getValue = (name: string) => metadata.find((item: any) => item.Name === name)?.Value;

//   await db.mpesaTransaction.updateMany({
//     where: {
//       checkoutRequestId: callback.CheckoutRequestID,
//     },
//     data: {
//       resultCode: callback.ResultCode,
//       resultDesc: callback.ResultDesc,
//       mpesaReceiptNumber: getValue("MpesaReceiptNumber"),
//       transactionDate: getValue("TransactionDate")?.toString(),
//     },
//   });

//   return NextResponse.json({ message: "Callback received" });
// }
