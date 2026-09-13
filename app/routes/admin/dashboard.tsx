import { useLoaderData } from "react-router";
import { db } from "~/db";
import { products, blogPosts, orders } from "~/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { formatPrice } from "~/utils/misc";

export async function loader() {
  const [productCount] = await db.select({ count: count() }).from(products);
  const [postCount] = await db.select({ count: count() }).from(blogPosts);
  const [orderCount] = await db.select({ count: count() }).from(orders);

  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(5);

  return {
    stats: {
      products: productCount.count,
      posts: postCount.count,
      orders: orderCount.count,
    },
    recentOrders,
  };
}

export default function AdminDashboard() {
  const { stats, recentOrders } = useLoaderData<typeof loader>();

  const statCards = [
    {
      label: "Products",
      value: stats.products,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
    {
      label: "Blog Posts",
      value: stats.posts,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V7.875c0-.621.504-1.125 1.125-1.125H7.5" />
        </svg>
      ),
    },
    {
      label: "Orders",
      value: stats.orders,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl text-cream">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-noir-surface border border-noir-border p-6 rounded-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-cream-dark">{card.icon}</span>
              <span className="text-3xl font-heading text-cream">{card.value}</span>
            </div>
            <p className="text-sm text-cream-muted tracking-wider uppercase">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-noir-surface border border-noir-border rounded-sm">
        <div className="px-6 py-4 border-b border-noir-border">
          <h2 className="font-heading text-xl text-cream">Recent Orders</h2>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-noir-border">
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-noir-border/50 hover:bg-noir-elevated/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-cream-muted">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-cream">{order.customerEmail || "—"}</td>
                    <td className="px-6 py-4 text-sm text-cream-muted">{order.total ? formatPrice(order.total) : "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] tracking-wider uppercase rounded-sm ${
                          order.status === "paid"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : order.status === "failed"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-gold/10 text-gold border border-gold/20"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-cream-dark">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-cream-muted">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
