import { Link, useLoaderData } from "react-router";
import { db } from "~/db";
import { products } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatPrice } from "~/utils/misc";
import { BUSINESS } from "~/config/business";

export function meta() {
  return [
    { title: `Pricing — ${BUSINESS.displayName}` },
    {
      name: "description",
      content: `Current fragrance prices from ${BUSINESS.legalName}. All prices in Indian Rupees, inclusive of applicable taxes.`,
    },
  ];
}

export async function loader() {
  const catalog = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      comparePrice: products.comparePrice,
      stock: products.stock,
    })
    .from(products)
    .where(eq(products.published, true))
    .orderBy(desc(products.createdAt));

  return { catalog };
}

export default function PricingPage() {
  const { catalog } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
        Pricing Details
      </p>
      <h1 className="font-heading text-4xl lg:text-5xl text-cream mb-6">
        Prices
      </h1>
      <p className="text-cream-muted leading-relaxed mb-12">
        All prices are in Indian Rupees (INR) and include applicable GST.
        Shipping within India is free. Stock and prices may change; the
        product page is the final price at checkout.
      </p>

      {catalog.length === 0 ? (
        <p className="text-cream-muted">
          Our collection is being curated. Check back soon.
        </p>
      ) : (
        <div className="border border-noir-border">
          <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-3 border-b border-noir-border text-[10px] tracking-wider uppercase text-cream-dark">
            <span>Fragrance</span>
            <span>Price</span>
          </div>
          {catalog.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.slug}`}
              className="grid grid-cols-[1fr_auto] gap-4 px-6 py-5 border-b border-noir-border last:border-b-0 hover:bg-noir-surface transition-colors"
            >
              <div>
                <p className="text-cream">{product.name}</p>
                <p className="text-xs text-cream-dark mt-1">
                  {(product.stock ?? 0) > 0 ? "In stock" : "Out of stock"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cream">{formatPrice(product.price)}</p>
                {product.comparePrice && product.comparePrice > product.price && (
                  <p className="text-xs text-cream-dark line-through">
                    {formatPrice(product.comparePrice)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
