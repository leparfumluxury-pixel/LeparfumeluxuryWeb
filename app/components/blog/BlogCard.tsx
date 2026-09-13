import { Link } from "react-router";
import type { BlogPost } from "~/db/schema";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block"
      id={`blog-card-${post.slug}`}
    >
      <div className="relative overflow-hidden bg-noir-surface rounded-sm aspect-[16/10]">
        <div className="product-image-container w-full h-full">
          <img
            src={post.coverImage || "/placeholder-blog.jpg"}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-noir-bg/90 via-noir-bg/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
            {post.author || "Le Parfume Luxury"} ·{" "}
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h3 className="font-heading text-2xl text-cream group-hover:text-gold transition-colors duration-300">
            {post.title}
          </h3>
        </div>
      </div>
      {post.excerpt && (
        <p className="mt-4 text-sm text-cream-muted leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>
      )}
    </Link>
  );
}
