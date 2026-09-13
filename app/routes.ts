import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  // Public routes with main layout
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("products", "routes/products.tsx"),
    route("products/:slug", "routes/product-detail.tsx"),
    route("blog", "routes/blog.tsx"),
    route("blog/:slug", "routes/blog-post.tsx"),
    route("cart", "routes/cart.tsx"),
    route("checkout", "routes/checkout.tsx"),
    route("checkout/success", "routes/checkout-success.tsx"),
    route("about", "routes/about.tsx"),
    route("contact", "routes/contact.tsx"),
    route("pricing", "routes/pricing.tsx"),
    route("privacy", "routes/privacy.tsx"),
    route("terms", "routes/terms.tsx"),
    route("shipping", "routes/shipping.tsx"),
    route("refunds", "routes/refunds.tsx"),
  ]),

  // Admin routes
  route("admin/login", "routes/admin/login.tsx"),
  layout("routes/admin/layout.tsx", [
    route("admin", "routes/admin/dashboard.tsx"),
    route("admin/products", "routes/admin/products.tsx"),
    route("admin/products/new", "routes/admin/products-new.tsx"),
    route("admin/products/:id/edit", "routes/admin/products-edit.tsx"),
    route("admin/blog", "routes/admin/blog.tsx"),
    route("admin/blog/new", "routes/admin/blog-new.tsx"),
    route("admin/blog/:id/edit", "routes/admin/blog-edit.tsx"),
    route("admin/orders", "routes/admin/orders.tsx"),
  ]),

  // API routes
  route("api/razorpay/create-order", "routes/api/razorpay-create-order.ts"),
  route("api/razorpay/verify", "routes/api/razorpay-verify.ts"),
  route("api/webhooks/razorpay", "routes/api/webhooks-razorpay.ts"),
] satisfies RouteConfig;
