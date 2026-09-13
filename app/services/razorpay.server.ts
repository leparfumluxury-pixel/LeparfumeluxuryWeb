import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createOrder(
  amount: number,
  currency: string = "INR",
  receipt?: string
) {
  const options = {
    amount, // in paise
    currency,
    receipt: receipt || `order_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  return order;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!);
  hmac.update(body);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
}
