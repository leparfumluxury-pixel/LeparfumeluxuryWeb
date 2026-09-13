import { useLoaderData, useFetcher, redirect, Link } from "react-router";
import { useEffect, useRef, useState } from "react";
import { getCart, getCartTotal, getAppliedCoupon } from "~/services/cart.server";
import { formatPrice } from "~/utils/misc";
import { db } from "~/db";
import { coupons } from "~/db/schema";
import { eq } from "drizzle-orm";
import { BUSINESS } from "~/config/business";

export function meta() {
  return [{ title: `Checkout — ${BUSINESS.displayName}` }];
}

export async function loader({ request }: { request: Request }) {
  const cart = await getCart(request);
  if (cart.length === 0) {
    throw redirect("/cart");
  }
  const total = getCartTotal(cart);
  const couponCode = await getAppliedCoupon(request);

  let discount = 0;
  let coupon = null;

  if (couponCode) {
    const [foundCoupon] = await db.select().from(coupons).where(eq(coupons.code, couponCode)).limit(1);
    if (foundCoupon && foundCoupon.active) {
      coupon = foundCoupon;
      if (foundCoupon.discountType === "percentage") {
        discount = Math.floor((total * foundCoupon.discountValue) / 100);
      } else if (foundCoupon.discountType === "fixed") {
        discount = Math.min(total, foundCoupon.discountValue);
      }
    }
  }

  return {
    cart,
    total,
    discount,
    coupon,
    finalTotal: total - discount,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
  };
}

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingCountry: string;
};

function orderPayload(customerInfo: CustomerInfo, extra: Record<string, string>) {
  return {
    ...extra,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    customerPhone: customerInfo.phone,
    shippingAddressLine1: customerInfo.shippingAddressLine1,
    shippingAddressLine2: customerInfo.shippingAddressLine2,
    shippingCity: customerInfo.shippingCity,
    shippingState: customerInfo.shippingState,
    shippingPincode: customerInfo.shippingPincode,
    shippingCountry: customerInfo.shippingCountry,
  };
}

export default function CheckoutPage() {
  const { cart, total, discount, coupon, finalTotal, razorpayKeyId } = useLoaderData<typeof loader>();
  const createOrderFetcher = useFetcher();
  const verifyFetcher = useFetcher();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPincode: "",
    shippingCountry: "India",
  });
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const razorpayLoaded = useRef(false);

  useEffect(() => {
    if (razorpayLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { razorpayLoaded.current = true; };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (createOrderFetcher.data && (createOrderFetcher.data as any).orderId) {
      openRazorpay((createOrderFetcher.data as any).orderId);
    }
    if (createOrderFetcher.data && (createOrderFetcher.data as any).error) {
      setError((createOrderFetcher.data as any).error);
      setIsProcessing(false);
    }
  }, [createOrderFetcher.data]);

  useEffect(() => {
    if (verifyFetcher.data && (verifyFetcher.data as any).success) {
      window.location.href = `/checkout/success?orderId=${(verifyFetcher.data as any).orderId}`;
    }
    if (verifyFetcher.data && (verifyFetcher.data as any).error) {
      setError((verifyFetcher.data as any).error);
      setIsProcessing(false);
    }
  }, [verifyFetcher.data]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError("Please fill in your name, email, and phone.");
      return;
    }
    if (
      !customerInfo.shippingAddressLine1 ||
      !customerInfo.shippingCity ||
      !customerInfo.shippingState ||
      !customerInfo.shippingPincode
    ) {
      setError("Please fill in your complete shipping address.");
      return;
    }
    if (!/^\d{6}$/.test(customerInfo.shippingPincode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }
    if (!agreedToPolicies) {
      setError("Please agree to the Terms and Refund Policy to continue.");
      return;
    }
    setError("");
    setIsProcessing(true);

    createOrderFetcher.submit(
      orderPayload(customerInfo, {
        amount: finalTotal.toString(),
        items: JSON.stringify(cart),
      }),
      { method: "post", action: "/api/razorpay/create-order" }
    );
  }

  function openRazorpay(orderId: string) {
    const options = {
      key: razorpayKeyId,
      amount: finalTotal.toString(),
      currency: "INR",
      name: BUSINESS.displayName,
      description: "Luxury Fragrances",
      order_id: orderId,
      handler: function (response: any) {
        verifyFetcher.submit(
          orderPayload(customerInfo, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: JSON.stringify(cart),
            total: finalTotal.toString(),
          }),
          { method: "post", action: "/api/razorpay/verify" }
        );
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone,
      },
      theme: {
        color: "#c9a96e",
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  const inputClass =
    "w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream placeholder:text-cream-dark focus:border-gold focus:outline-none transition-colors";
  const labelClass = "block text-sm text-cream-muted mb-2 tracking-wider uppercase";

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-heading text-4xl text-cream mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="font-heading text-2xl text-cream">
              Contact Information
            </h2>
            <div>
              <label className={labelClass} htmlFor="checkout-name">
                Full Name *
              </label>
              <input
                type="text"
                id="checkout-name"
                required
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="checkout-email">
                Email Address *
              </label>
              <input
                type="email"
                id="checkout-email"
                required
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="checkout-phone">
                Phone *
              </label>
              <input
                type="tel"
                id="checkout-phone"
                required
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                className={inputClass}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <h2 className="font-heading text-2xl text-cream pt-4">
              Shipping Address
            </h2>
            <div>
              <label className={labelClass} htmlFor="checkout-line1">
                Address line 1 *
              </label>
              <input
                type="text"
                id="checkout-line1"
                required
                value={customerInfo.shippingAddressLine1}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    shippingAddressLine1: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="House / street"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="checkout-line2">
                Address line 2
              </label>
              <input
                type="text"
                id="checkout-line2"
                value={customerInfo.shippingAddressLine2}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    shippingAddressLine2: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Landmark (optional)"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="checkout-city">
                  City *
                </label>
                <input
                  type="text"
                  id="checkout-city"
                  required
                  value={customerInfo.shippingCity}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      shippingCity: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Bengaluru"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="checkout-state">
                  State *
                </label>
                <input
                  type="text"
                  id="checkout-state"
                  required
                  value={customerInfo.shippingState}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      shippingState: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Karnataka"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="checkout-pincode">
                  PIN code *
                </label>
                <input
                  type="text"
                  id="checkout-pincode"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={customerInfo.shippingPincode}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      shippingPincode: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className={inputClass}
                  placeholder="560053"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="checkout-country">
                  Country
                </label>
                <input
                  type="text"
                  id="checkout-country"
                  readOnly
                  value={customerInfo.shippingCountry}
                  className={`${inputClass} opacity-80`}
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-cream-muted leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToPolicies}
                onChange={(e) => setAgreedToPolicies(e.target.checked)}
                className="mt-1 accent-gold"
                id="checkout-agree"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="text-gold hover:text-gold-light">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link to="/refunds" className="text-gold hover:text-gold-light">
                  Cancellation and Refund Policy
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm rounded-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              id="pay-now-btn"
            >
              {isProcessing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ${formatPrice(finalTotal)}`
              )}
            </button>
          </form>
        </div>

        <div>
          <h2 className="font-heading text-2xl text-cream mb-6">
            Order Summary
          </h2>
          <div className="bg-noir-surface border border-noir-border p-6 rounded-sm">
            <div className="space-y-4 pb-6 border-b border-noir-border">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-noir-muted rounded-sm overflow-hidden shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-cream">{item.name}</p>
                    <p className="text-xs text-cream-dark">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm text-cream-muted">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-6 border-b border-noir-border">
              <div className="flex justify-between text-sm">
                <span className="text-cream-muted">Subtotal</span>
                <span className="text-cream">{formatPrice(total)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Discount ({coupon?.code})</span>
                  <span className="text-green-400">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-cream-muted">Shipping</span>
                <span className="text-cream-muted">Free Shipping</span>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <span className="text-cream font-medium">Total</span>
              <span className="text-cream text-lg font-heading">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
