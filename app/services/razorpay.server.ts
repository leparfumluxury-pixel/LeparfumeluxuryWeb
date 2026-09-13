import Razorpay from "razorpay";
import crypto from "crypto";
import { requireEnv } from "~/utils/env.server";

let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: requireEnv("RAZORPAY_KEY_ID"),
      key_secret: requireEnv("RAZORPAY_KEY_SECRET"),
    });
  }
  return _razorpay;
}

export async function createOrder(
  amount: number,
  currency: string = "INR",
  receipt?: string,
) {
  const options = {
    amount, // in paise
    currency,
    receipt: receipt || `order_${Date.now()}`,
  };

  const order = await getRazorpay().orders.create(options);
  return order;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const hmac = crypto.createHmac("sha256", requireEnv("RAZORPAY_KEY_SECRET"));
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
): boolean {
  const hmac = crypto.createHmac(
    "sha256",
    requireEnv("RAZORPAY_WEBHOOK_SECRET"),
  );
  hmac.update(body);
  const generatedSignature = hmac.digest("hex");
  return generatedSignature === signature;
}
