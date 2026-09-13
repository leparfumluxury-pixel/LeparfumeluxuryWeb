import { createCookieSessionStorage } from "react-router";
import { getSessionSecret } from "~/utils/env.server";

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
}

// Validate early so Vercel logs show a clear message instead of a crypto crash.
getSessionSecret();

const cartStorage = createCookieSessionStorage({
  cookie: {
    name: "__maison_noir_cart",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getCart(request: Request): Promise<CartItem[]> {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  return session.get("cart") || [];
}

export async function addToCart(request: Request, item: CartItem) {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  const cart: CartItem[] = session.get("cart") || [];

  const existingIndex = cart.findIndex(
    (i) => i.productId === item.productId,
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  session.set("cart", cart);
  return cartStorage.commitSession(session);
}

export async function updateCartQuantity(
  request: Request,
  productId: number,
  quantity: number,
) {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  const cart: CartItem[] = session.get("cart") || [];

  const index = cart.findIndex((i) => i.productId === productId);
  if (index >= 0) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
  }

  session.set("cart", cart);
  return cartStorage.commitSession(session);
}

export async function removeFromCart(request: Request, productId: number) {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  const cart: CartItem[] = session.get("cart") || [];

  const filtered = cart.filter((i) => i.productId !== productId);
  session.set("cart", filtered);
  return cartStorage.commitSession(session);
}

export async function clearCart(request: Request) {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  session.set("cart", []);
  return cartStorage.commitSession(session);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export async function getAppliedCoupon(
  request: Request,
): Promise<string | null> {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  return session.get("coupon") || null;
}

export async function setAppliedCoupon(request: Request, code: string | null) {
  const session = await cartStorage.getSession(request.headers.get("Cookie"));
  if (code) {
    session.set("coupon", code.toUpperCase());
  } else {
    session.unset("coupon");
  }
  return cartStorage.commitSession(session);
}
