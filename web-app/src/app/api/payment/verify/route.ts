import crypto from "crypto";
import { getUserIdentifier, markAsPaid } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();

    // Validate all required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json(
        { error: "Missing required payment fields" },
        { status: 400 },
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET not configured");
      return Response.json(
        { error: "Payment verification unavailable" },
        { status: 500 },
      );
    }

    // Compute expected HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Derive identifier from request headers (same compound key as other routes)
    const identifier = getUserIdentifier(req);

    // Mark user as paid in Redis
    await markAsPaid(identifier);

    return Response.json({
      success: true,
      message: "Payment verified, quota unlocked",
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return Response.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
