import { Link, useSearchParams } from "react-router";
import { clearCart } from "~/services/cart.server";

export function meta() {
  return [{ title: "Order Confirmed — Le Parfume Luxury" }];
}

export async function loader({ request }: { request: Request }) {
  const cookieHeader = await clearCart(request);
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookieHeader,
    },
  });
}

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-8 py-24 text-center">
      <div className="animate-fade-in-up">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-gold flex items-center justify-center">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
          Thank You
        </p>
        <h1 className="font-heading text-4xl lg:text-5xl text-cream mb-4">
          Order Confirmed
        </h1>
        <p className="text-cream-muted leading-relaxed mb-2">
          Your order has been placed successfully. We're preparing your
          extraordinary fragrance with care.
        </p>
        {orderId && (
          <p className="text-xs text-cream-dark tracking-wider mb-8">
            Order Reference: {orderId}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            to="/products"
            className="px-10 py-4 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="px-10 py-4 border border-cream/20 text-cream text-sm tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
