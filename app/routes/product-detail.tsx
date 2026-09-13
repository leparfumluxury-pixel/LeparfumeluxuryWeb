import { useLoaderData, Form, redirect, data } from "react-router";
import { db } from "~/db";
import { products } from "~/db/schema";
import { eq } from "drizzle-orm";
import { ProductImageGallery } from "~/components/product/ProductImageGallery";
import { FragrancePyramid } from "~/components/product/FragrancePyramid";
import { ProductCard } from "~/components/product/ProductCard";
import { formatPrice } from "~/utils/misc";
import { addToCart } from "~/services/cart.server";

export function meta({ data: loaderData }: { data: Awaited<ReturnType<typeof loader>> }) {
  if (!loaderData?.product) {
    return [{ title: "Product Not Found — Le Parfume Luxury" }];
  }
  return [
    { title: `${loaderData.product.name} — Le Parfume Luxury` },
    { name: "description", content: loaderData.product.description?.slice(0, 160) },
  ];
}

export async function loader({ params }: { params: { slug: string } }) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, params.slug))
    .limit(1);

  if (!product || !product.published) {
    throw data("Product not found", { status: 404 });
  }

  // Related products (same category, excluding current)
  let relatedProducts: any[] = [];
  if (product.category) {
    relatedProducts = await db
      .select()
      .from(products)
      .where(eq(products.category, product.category))
      .limit(4);
    relatedProducts = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3);
  }

  return { product, relatedProducts };
}

export async function action({ request, params }: { request: Request; params: { slug: string } }) {
  const formData = await request.formData();
  const quantity = parseInt(formData.get("quantity") as string) || 1;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, params.slug))
    .limit(1);

  if (!product) {
    return data({ error: "Product not found" }, { status: 404 });
  }

  const cookieHeader = await addToCart(request, {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images?.[0] || "",
    quantity,
  });

  return redirect("/cart", {
    headers: { "Set-Cookie": cookieHeader },
  });
}

export default function ProductDetailPage() {
  const { product, relatedProducts } = useLoaderData<typeof loader>();
  const images = (product.images as string[]) || [];
  const notes = product.notes as { top: string[]; middle: string[]; base: string[] } | null;
  const inStock = (product.stock || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="animate-fade-in">
          <ProductImageGallery images={images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="animate-fade-in-up space-y-8">
          <div>
            {product.category && (
              <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
                {product.category}
              </p>
            )}
            <h1 className="font-heading text-4xl lg:text-5xl text-cream mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-2xl text-cream-muted tracking-wider">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg text-cream-dark line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-cream-muted leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-xs tracking-wider uppercase text-cream-muted">
              {inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </span>
          </div>

          {/* Add to Cart */}
          <Form method="post" className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-cream-muted tracking-wider uppercase">
                Qty
              </label>
              <select
                name="quantity"
                defaultValue="1"
                className="px-4 py-2 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!inStock}
              className="w-full py-4 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              id="add-to-cart"
            >
              {inStock ? "Add to Bag" : "Sold Out"}
            </button>
          </Form>

          {/* Fragrance Notes Pyramid */}
          {notes && (
            <div className="border-t border-noir-border pt-8">
              <FragrancePyramid notes={notes} />
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 lg:mt-32 border-t border-noir-border pt-16">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-3">
              You May Also Like
            </p>
            <h2 className="font-heading text-3xl text-cream">
              Related Fragrances
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
