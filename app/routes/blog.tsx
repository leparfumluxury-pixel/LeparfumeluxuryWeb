import { useLoaderData } from "react-router";
import { db } from "~/db";
import { blogPosts } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { BlogCard } from "~/components/blog/BlogCard";

import { cacheGet, cacheSet } from "~/utils/cache.server";

export function meta() {
  return [
    { title: "Journal — Le Parfume Luxury" },
    {
      name: "description",
      content: "Stories, inspiration, and the art behind Le Parfume Luxury fragrances.",
    },
  ];
}

export async function loader() {
  const cacheKey = "blog-posts-list";
  const cached = cacheGet<{ posts: any[] }>(cacheKey);
  if (cached) return cached;

  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt));

  const data = { posts };
  cacheSet(cacheKey, data, 60000); // 60s cache
  return data;
}

export default function BlogPage() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center mb-16 animate-fade-in-up">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
          Stories & Inspiration
        </p>
        <h1 className="font-heading text-4xl lg:text-6xl text-cream">
          The Journal
        </h1>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 stagger-children">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="font-heading text-2xl text-cream mb-2">
            Stories coming soon
          </p>
          <p className="text-cream-muted text-sm">
            We're crafting narratives as carefully as our fragrances.
          </p>
        </div>
      )}
    </div>
  );
}
