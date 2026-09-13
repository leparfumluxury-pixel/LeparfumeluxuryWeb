import { useLoaderData, Link, Form, data } from "react-router";
import { db } from "~/db";
import { products } from "~/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatPrice } from "~/utils/misc";

export async function loader() {
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));
  return { products: allProducts };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = parseInt(formData.get("id") as string);

  if (intent === "togglePublished") {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (product) {
      await db
        .update(products)
        .set({ published: !product.published, updatedAt: new Date() })
        .where(eq(products.id, id));
    }
  }

  if (intent === "delete") {
    await db.delete(products).where(eq(products.id, id));
  }

  const { cacheClear } = await import("~/utils/cache.server");
  cacheClear();

  return data({ ok: true });
}

export default function AdminProductsPage() {
  const { products: allProducts } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-cream">Products</h1>
        <Link
          to="/admin/products/new"
          className="px-6 py-2.5 bg-gold text-noir-bg text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors"
          id="add-product-btn"
        >
          + New Product
        </Link>
      </div>

      <div className="bg-noir-surface border border-noir-border rounded-sm overflow-hidden">
        {allProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-noir-border">
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs text-cream-dark tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product) => (
                  <tr key={product.id} className="border-b border-noir-border/50 hover:bg-noir-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-noir-muted rounded-sm overflow-hidden shrink-0">
                          {product.images && (product.images as string[]).length > 0 ? (
                            <img src={(product.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="text-sm text-cream">{product.name}</p>
                          <p className="text-xs text-cream-dark">{product.category || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-cream-muted">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 text-sm text-cream-muted">{product.stock}</td>
                    <td className="px-6 py-4">
                      <Form method="post">
                        <input type="hidden" name="intent" value="togglePublished" />
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded-sm transition-colors ${
                            product.published
                              ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                              : "bg-cream-dark/10 text-cream-dark border border-cream-dark/20 hover:bg-cream-dark/20"
                          }`}
                        >
                          {product.published ? "Published" : "Draft"}
                        </button>
                      </Form>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="px-3 py-1.5 text-xs text-cream-muted border border-noir-border hover:border-gold hover:text-gold transition-colors"
                        >
                          Edit
                        </Link>
                        <Form method="post" onSubmit={(e) => { if (!confirm("Delete this product?")) e.preventDefault(); }}>
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs text-red-400/70 border border-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-cream-muted">
            <p>No products yet.</p>
            <Link to="/admin/products/new" className="text-gold hover:text-gold-light text-sm mt-2 inline-block">
              Create your first product →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
