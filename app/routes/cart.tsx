import { useLoaderData, Form, Link, redirect, data } from "react-router";
import { getCart, updateCartQuantity, removeFromCart, getCartTotal, getAppliedCoupon, setAppliedCoupon } from "~/services/cart.server";
import { formatPrice } from "~/utils/misc";
import { db } from "~/db";
import { coupons } from "~/db/schema";
import { eq } from "drizzle-orm";

export function meta() {
  return [{ title: "Shopping Bag — Le Parfume Luxury" }];
}

export async function loader({ request }: { request: Request }) {
  const cart = await getCart(request);
  const total = getCartTotal(cart);
  const couponCode = await getAppliedCoupon(request);

  let discount = 0;
  let coupon = null;
  let couponError = null;

  if (couponCode) {
    const [foundCoupon] = await db.select().from(coupons).where(eq(coupons.code, couponCode)).limit(1);
    if (foundCoupon && foundCoupon.active) {
      coupon = foundCoupon;
      if (foundCoupon.discountType === "percentage") {
        discount = Math.floor((total * foundCoupon.discountValue) / 100);
      } else if (foundCoupon.discountType === "fixed") {
        discount = Math.min(total, foundCoupon.discountValue);
      }
    } else {
      couponError = "Invalid or expired coupon code.";
    }
  }

  return { cart, total, discount, coupon, couponError };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "update") {
    const productId = parseInt(formData.get("productId") as string);
    const quantity = parseInt(formData.get("quantity") as string);
    const cookieHeader = await updateCartQuantity(request, productId, quantity);
    return data({ ok: true }, { headers: { "Set-Cookie": cookieHeader } });
  }

  if (intent === "remove") {
    const productId = parseInt(formData.get("productId") as string);
    const cookieHeader = await removeFromCart(request, productId);
    return data({ ok: true }, { headers: { "Set-Cookie": cookieHeader } });
  }

  if (intent === "applyCoupon") {
    const code = (formData.get("couponCode") as string || "").trim().toUpperCase();
    if (!code) {
      return data({ error: "Coupon code cannot be empty" }, { status: 400 });
    }
    // Check if coupon actually exists in database before storing
    const [foundCoupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
    if (!foundCoupon || !foundCoupon.active) {
      const cookieHeader = await setAppliedCoupon(request, null);
      return redirect("/cart?error=invalid", {
        headers: { "Set-Cookie": cookieHeader },
      });
    }
    const cookieHeader = await setAppliedCoupon(request, code);
    return redirect("/cart", {
      headers: { "Set-Cookie": cookieHeader },
    });
  }

  if (intent === "removeCoupon") {
    const cookieHeader = await setAppliedCoupon(request, null);
    return redirect("/cart", {
      headers: { "Set-Cookie": cookieHeader },
    });
  }

  return data({ error: "Invalid action" }, { status: 400 });
}

export default function CartPage() {
  const { cart, total, discount, coupon, couponError } = useLoaderData<typeof loader>();
  const finalTotal = total - discount;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-24 text-center">
        <div className="mb-8">
          <svg className="w-16 h-16 mx-auto text-cream-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h1 className="font-heading text-3xl text-cream mb-4">
          Your Bag is Empty
        </h1>
        <p className="text-cream-muted mb-8">
          Discover our collection of extraordinary fragrances.
        </p>
        <Link
          to="/products"
          className="inline-block px-10 py-4 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300"
        >
          Shop Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-heading text-4xl text-cream mb-12">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex gap-6 p-4 bg-noir-surface border border-noir-border rounded-sm"
            >
              {/* Image */}
              <Link
                to={`/products/${item.slug}`}
                className="w-24 h-32 shrink-0 bg-noir-muted rounded-sm overflow-hidden"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cream-dark text-xs">
                     No Image
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/products/${item.slug}`}
                    className="font-heading text-lg text-cream hover:text-gold transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-cream-muted mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity */}
                  <Form method="post" className="flex items-center gap-2">
                    <input type="hidden" name="intent" value="update" />
                    <input type="hidden" name="productId" value={item.productId} />
                    <select
                      name="quantity"
                      defaultValue={item.quantity}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className="px-3 py-1.5 bg-noir-bg border border-noir-border text-cream text-sm focus:border-gold focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </Form>

                  {/* Remove */}
                  <Form method="post">
                    <input type="hidden" name="intent" value="remove" />
                    <input type="hidden" name="productId" value={item.productId} />
                    <button
                      type="submit"
                      className="text-xs text-cream-dark hover:text-red-400 tracking-wider uppercase transition-colors"
                    >
                      Remove
                    </button>
                  </Form>
                </div>
              </div>

              {/* Line Total */}
              <div className="text-right">
                <p className="text-sm text-cream-muted">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-noir-surface border border-noir-border p-6 rounded-sm sticky top-28 space-y-6">
            <div>
              <h2 className="font-heading text-xl text-cream mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 pb-6 border-b border-noir-border">
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
                  <span className="text-cream-muted">Calculated at checkout</span>
                </div>
              </div>
              <div className="flex justify-between py-6">
                <span className="text-cream font-medium">Total</span>
                <span className="text-cream text-lg font-heading">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Coupon Code section */}
            <div className="border-t border-noir-border pt-6">
              <span className="block text-xs text-cream-muted tracking-wider uppercase mb-3">
                Promo / Coupon Code
              </span>

              {coupon ? (
                <div className="flex items-center justify-between p-3 bg-gold/10 border border-gold/20 rounded-sm">
                  <div>
                    <span className="text-xs font-bold text-gold tracking-wider uppercase">{coupon.code}</span>
                    <span className="block text-[10px] text-cream-muted mt-0.5">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% Off applied` : `₹${coupon.discountValue / 100} Off applied`}
                    </span>
                  </div>
                  <Form method="post">
                    <input type="hidden" name="intent" value="removeCoupon" />
                    <button type="submit" className="text-xs text-red-400/80 hover:text-red-400 uppercase tracking-wider">
                      Remove
                    </button>
                  </Form>
                </div>
              ) : (
                <Form method="post" className="space-y-2">
                  <input type="hidden" name="intent" value="applyCoupon" />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="couponCode"
                      placeholder="e.g. WELCOME10"
                      required
                      className="flex-1 min-w-0 px-3 py-2 bg-noir-bg border border-noir-border text-cream text-xs placeholder:text-cream-dark focus:border-gold focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold/10 border border-gold/30 text-gold text-xs tracking-wider uppercase hover:bg-gold hover:text-noir-bg transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {(couponError || typeof window !== "undefined" && new URLSearchParams(window.location.search).get("error") === "invalid") && (
                    <p className="text-[11px] text-red-400 mt-1">
                      {couponError || "Invalid or expired coupon code."}
                    </p>
                  )}
                </Form>
              )}
            </div>

            <Link
              to="/checkout"
              className="block w-full py-4 bg-gold text-noir-bg text-center text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300"
              id="checkout-btn"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
