import { useLoaderData, data } from "react-router";
import { db } from "~/db";
import { blogPosts } from "~/db/schema";
import { eq } from "drizzle-orm";

export function meta({ data: loaderData }: { data: Awaited<ReturnType<typeof loader>> }) {
  if (!loaderData?.post) return [{ title: "Post Not Found — Le Parfume Luxury" }];
  return [
    { title: `${loaderData.post.title} — Le Parfume Luxury Journal` },
    { name: "description", content: loaderData.post.excerpt || "" },
  ];
}

export async function loader({ params }: { params: { slug: string } }) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, params.slug))
    .limit(1);

  if (!post || !post.published) {
    throw data("Post not found", { status: 404 });
  }

  return { post };
}

export default function BlogPostPage() {
  const { post } = useLoaderData<typeof loader>();

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
      {/* Header */}
      <header className="text-center mb-12 animate-fade-in-up">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-4">
          {post.author || "Le Parfume Luxury"} ·{" "}
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <h1 className="font-heading text-4xl lg:text-5xl text-cream leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-6 text-cream-muted text-lg leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-12 aspect-[16/9] overflow-hidden rounded-sm animate-fade-in">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose-noir"
        dangerouslySetInnerHTML={{ __html: post.content || "" }}
      />
    </article>
  );
}
