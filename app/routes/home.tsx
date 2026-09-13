import { Link, useLoaderData } from "react-router";
import { db } from "~/db";
import { products, blogPosts } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { ProductCard } from "~/components/product/ProductCard";
import { BlogCard } from "~/components/blog/BlogCard";

import { cacheGet, cacheSet } from "~/utils/cache.server";

export function meta() {
  return [
    { title: "Le Parfume Luxury — Fragrances" },
    {
      name: "description",
      content:
        "Discover extraordinary fragrances crafted for those who dare to stand apart. Le Parfume Luxury — where darkness meets elegance.",
    },
  ];
}

export async function loader() {
  const cacheKey = "home-data";
  const cached = cacheGet<{ featuredProducts: any[]; latestPosts: any[] }>(cacheKey);
  if (cached) return cached;

  const featuredProducts = await db
    .select()
    .from(products)
    .where(eq(products.published, true))
    .orderBy(desc(products.createdAt))
    .limit(4);

  const latestPosts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt))
    .limit(2);

  const data = { featuredProducts, latestPosts };
  cacheSet(cacheKey, data, 30000); // 30s cache
  return data;
}

export default function HomePage() {
  const { featuredProducts, latestPosts } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* ═══════ Hero Section ═══════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 bg-noir-bg overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="/LaperfumeTest.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-noir-bg via-transparent to-noir-bg opacity-75" />
          <div className="absolute inset-0 bg-noir-bg/40" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(201,169,110,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6 animate-fade-in-up">
          <p className="text-[11px] tracking-[0.5em] uppercase text-gold mb-6">
            L'Art de la Parfumerie
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-8xl text-cream leading-[0.95] mb-8">
            Where Darkness
            <br />
            <span className="italic text-gold">Meets Elegance</span>
          </h1>
          <p className="text-cream-muted text-base sm:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Each fragrance is a carefully composed symphony of rare ingredients,
            designed to leave an unforgettable impression.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-10 py-4 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300"
              id="hero-cta"
            >
              Explore Collection
            </Link>
            <Link
              to="/about"
              className="px-10 py-4 border border-cream/20 text-cream text-sm tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-300"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        </div>
      </section>

      {/* ═══════ Featured Collection ═══════ */}
      <section className="py-24 lg:py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Curated Selection
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl text-cream">
            The Collection
          </h2>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-cream-muted text-lg">
              Our collection is being curated.
            </p>
            <p className="text-cream-dark text-sm mt-2">
              Check back soon for extraordinary fragrances.
            </p>
          </div>
        )}

        <div className="text-center mt-16">
          <Link
            to="/products"
            className="inline-block px-10 py-4 border border-gold/30 text-gold text-sm tracking-[0.2em] uppercase hover:bg-gold hover:text-noir-bg transition-all duration-300"
            id="view-all-products"
          >
            View All Fragrances
          </Link>
        </div>
      </section>

      {/* ═══════ Editorial / Brand Section ═══════ */}
      <section className="py-24 lg:py-32 bg-noir-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold">
              The House
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl text-cream leading-tight">
              A Legacy of
              <br />
              <span className="italic">Extraordinary</span> Craft
            </h2>
            <div className="space-y-4 text-cream-muted leading-relaxed">
              <p>
                Born from an obsession with the extraordinary, Le Parfume Luxury
                creates fragrances that defy convention. Each composition is a
                journey through memory, emotion, and the art of living
                beautifully.
              </p>
              <p>
                Our master perfumers source the rarest ingredients from every
                corner of the world — oud from the forests of Assam, rose
                absolute from Grasse, and vetiver from the volcanic soils of
                Réunion.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-3 text-gold text-sm tracking-[0.15em] uppercase hover:gap-5 transition-all duration-300 group"
            >
              Read Our Story
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] bg-noir-muted rounded-sm overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-noir-muted via-noir-elevated to-noir-surface flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border border-gold/20 flex items-center justify-center">
                    <span className="font-heading text-4xl text-gold italic">L</span>
                  </div>
                  <p className="text-cream-dark text-xs tracking-[0.3em] uppercase">Since 2024</p>
                </div>
              </div>
            </div>
            {/* Decorative corner */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-gold/10 rounded-sm" />
          </div>
        </div>
      </section>

      {/* ═══════ Journal Preview ═══════ */}
      {latestPosts.length > 0 && (
        <section className="py-24 lg:py-32 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
              From The Journal
            </p>
            <h2 className="font-heading text-4xl lg:text-5xl text-cream">
              Stories & Inspiration
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════ Newsletter ═══════ */}
      <section className="py-24 lg:py-32 bg-noir-surface border-t border-noir-border">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
            Stay Connected
          </p>
          <h2 className="font-heading text-3xl lg:text-4xl text-cream mb-4">
            Stay Close
          </h2>
          <p className="text-cream-muted text-sm mb-8">
            Be the first to discover new fragrances, receive exclusive offers,
            and explore the world of Le Parfume Luxury.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3 bg-noir-bg border border-noir-border text-cream text-sm placeholder:text-cream-dark focus:border-gold focus:outline-none transition-colors"
              id="newsletter-email"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gold text-noir-bg text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors duration-300"
              id="newsletter-submit"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
