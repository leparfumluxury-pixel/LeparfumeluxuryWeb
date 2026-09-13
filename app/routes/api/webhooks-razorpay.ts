import { data } from "react-router";
import { verifyWebhookSignature } from "~/services/razorpay.server";
import { db } from "~/db";
import { orders } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return data({ error: "Missing signature" }, { status: 400 });
    }

    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return data({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      await db.update(orders)
        .set({ status: "paid", razorpayPaymentId: payment.id })
        .where(eq(orders.razorpayOrderId, payment.order_id));
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      await db.update(orders)
        .set({ status: "failed" })
        .where(eq(orders.razorpayOrderId, payment.order_id));
    }

    return data({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return data({ error: "Webhook processing failed" }, { status: 500 });
  }
}
