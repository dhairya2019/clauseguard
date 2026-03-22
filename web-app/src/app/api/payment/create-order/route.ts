import Razorpay from "razorpay";
import { getUserIdentifier } from "@/lib/redis";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const identifier = getUserIdentifier(req);

    const order = await razorpay.orders.create({
      amount: 29900, // INR 299.00 in paise
      currency: "INR",
      receipt: `cg_${Date.now()}`,
      notes: { identifier },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    return Response.json(
      { error: "Failed to create payment order" },
      { status: 500 },
    );
  }
}
