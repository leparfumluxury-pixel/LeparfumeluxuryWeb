import { useLoaderData } from "react-router";
import { db } from "~/db";
import { orders } from "~/db/schema";
import { desc } from "drizzle-orm";
import { formatPrice } from "~/utils/misc";

export async function loader() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return { orders: allOrders };
}

export default function AdminOrdersPage() {
  const { orders: allOrders } = useLoaderData<typeof loader>();
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-cream">Orders</h1>
      <div className="bg-noir-surface border border-noir-border rounded-sm overflow-hidden">
        {allOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-noir-border">
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order) => (
                  <tr key={order.id} className="border-b border-noir-border/50 hover:bg-noir-elevated/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-cream-muted">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-cream">{order.customerName || "—"}</p>
                      <p className="text-xs text-cream-dark">{order.customerEmail || ""}</p>
                      {order.customerPhone && (
                        <p className="text-xs text-cream-dark">{order.customerPhone}</p>
                      )}
                      {order.shippingAddressLine1 && (
                        <p className="text-xs text-cream-dark mt-1">
                          {[
                            order.shippingAddressLine1,
                            order.shippingAddressLine2,
                            order.shippingCity,
                            order.shippingState,
                            order.shippingPincode,
                            order.shippingCountry,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-cream-muted">{Array.isArray(order.items) ? order.items.length : 0} items</td>
                    <td className="px-6 py-4 text-sm text-cream-muted">{order.total ? formatPrice(order.total) : "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded-sm ${order.status === "paid" ? "bg-green-500/10 text-green-400 border border-green-500/20" : order.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-gold/10 text-gold border border-gold/20"}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-cream-dark">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-cream-muted">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
