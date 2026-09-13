import { data } from "react-router";
import { verifyPaymentSignature } from "~/services/razorpay.server";
import { db } from "~/db";
import { orders } from "~/db/schema";

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const razorpayOrderId = formData.get("razorpay_order_id") as string;
    const razorpayPaymentId = formData.get("razorpay_payment_id") as string;
    const razorpaySignature = formData.get("razorpay_signature") as string;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const shippingAddressLine1 = formData.get("shippingAddressLine1") as string;
    const shippingAddressLine2 = (formData.get("shippingAddressLine2") as string) || null;
    const shippingCity = formData.get("shippingCity") as string;
    const shippingState = formData.get("shippingState") as string;
    const shippingPincode = formData.get("shippingPincode") as string;
    const shippingCountry = (formData.get("shippingCountry") as string) || "India";
    const items = JSON.parse(formData.get("items") as string);
    const total = parseInt(formData.get("total") as string);

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return data({ error: "Payment verification failed" }, { status: 400 });
    }

    const [order] = await db.insert(orders).values({
      razorpayOrderId,
      razorpayPaymentId,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingPincode,
      shippingCountry,
      items,
      total,
      status: "paid",
    }).returning();

    return data({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return data({ error: "Verification failed" }, { status: 500 });
  }
}
