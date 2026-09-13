import { useLoaderData, Link, Form, data } from "react-router";
import { db } from "~/db";
import { blogPosts } from "~/db/schema";
import { desc, eq } from "drizzle-orm";

export async function loader() {
  const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return { posts };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const id = parseInt(formData.get("id") as string);

  if (intent === "togglePublished") {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (post) {
      await db.update(blogPosts).set({ published: !post.published, updatedAt: new Date() }).where(eq(blogPosts.id, id));
    }
  }

  if (intent === "delete") {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  const { cacheClear } = await import("~/utils/cache.server");
  cacheClear();

  return data({ ok: true });
}

export default function AdminBlogPage() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-cream">Blog Posts</h1>
        <Link to="/admin/blog/new" className="px-6 py-2.5 bg-gold text-noir-bg text-sm tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors">
          + New Post
        </Link>
      </div>

      <div className="bg-noir-surface border border-noir-border rounded-sm overflow-hidden">
        {posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-noir-border">
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Post</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Author</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs text-cream-dark tracking-wider uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs text-cream-dark tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-noir-border/50 hover:bg-noir-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-cream">{post.title}</p>
                      <p className="text-xs text-cream-dark truncate max-w-xs">{post.excerpt || "—"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-cream-muted">{post.author || "—"}</td>
                    <td className="px-6 py-4">
                      <Form method="post">
                        <input type="hidden" name="intent" value="togglePublished" />
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded-sm transition-colors ${post.published ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-cream-dark/10 text-cream-dark border border-cream-dark/20"}`}>
                          {post.published ? "Published" : "Draft"}
                        </button>
                      </Form>
                    </td>
                    <td className="px-6 py-4 text-sm text-cream-dark">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/blog/${post.id}/edit`} className="px-3 py-1.5 text-xs text-cream-muted border border-noir-border hover:border-gold hover:text-gold transition-colors">Edit</Link>
                        <Form method="post" onSubmit={(e) => { if (!confirm("Delete this post?")) e.preventDefault(); }}>
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="id" value={post.id} />
                          <button type="submit" className="px-3 py-1.5 text-xs text-red-400/70 border border-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors">Delete</button>
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
            <p>No blog posts yet.</p>
            <Link to="/admin/blog/new" className="text-gold hover:text-gold-light text-sm mt-2 inline-block">Write your first post →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
