import { data } from "react-router";
import { createOrder } from "~/services/razorpay.server";

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const amount = parseInt(formData.get("amount") as string);

    if (!amount || amount <= 0) {
      return data({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await createOrder(amount, "INR");
    return data({ orderId: order.id, amount: order.amount });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return data({ error: "Failed to create payment order" }, { status: 500 });
  }
}
