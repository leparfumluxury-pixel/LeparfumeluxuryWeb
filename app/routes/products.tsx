import { useLoaderData, useSearchParams } from "react-router";
import { db } from "~/db";
import { products } from "~/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { ProductCard } from "~/components/product/ProductCard";
import { FilterSidebar } from "~/components/product/FilterSidebar";

import { cacheGet, cacheSet } from "~/utils/cache.server";

export function meta() {
  return [
    { title: "Collection — Le Parfume Luxury" },
    {
      name: "description",
      content:
        "Explore our curated collection of luxury fragrances. Each scent tells a story of rare ingredients and masterful composition.",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");

  const cacheKey = `products-${category || "all"}-${minPrice || "0"}-${maxPrice || "any"}`;
  const cached = cacheGet<{ products: any[]; categories: string[] }>(cacheKey);
  if (cached) return cached;

  const conditions = [eq(products.published, true)];

  if (category) {
    conditions.push(eq(products.category, category));
  }
  if (minPrice) {
    conditions.push(gte(products.price, parseInt(minPrice) * 100));
  }
  if (maxPrice) {
    conditions.push(lte(products.price, parseInt(maxPrice) * 100));
  }

  const allProducts = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));

  // Get unique categories
  const categoriesResult = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(eq(products.published, true));

  const categories = categoriesResult
    .map((r) => r.category)
    .filter(Boolean) as string[];

  const data = { products: allProducts, categories };
  cacheSet(cacheKey, data, 30000); // 30s cache
  return data;
}

export default function ProductsPage() {
  const { products: allProducts, categories } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
          Discover
        </p>
        <h1 className="font-heading text-4xl lg:text-6xl text-cream">
          The Collection
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <div className="lg:w-56 shrink-0">
          <FilterSidebar
            categories={categories}
            currentCategory={searchParams.get("category") || undefined}
            currentMinPrice={searchParams.get("minPrice") || undefined}
            currentMaxPrice={searchParams.get("maxPrice") || undefined}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="font-heading text-2xl text-cream mb-2">
                No fragrances found
              </p>
              <p className="text-cream-muted text-sm">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
