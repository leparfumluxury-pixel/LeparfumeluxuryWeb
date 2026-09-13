import { Form, redirect, useLoaderData, useNavigation, useActionData, data } from "react-router";
import { db } from "~/db";
import { blogPosts } from "~/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "~/utils/misc";
import * as nodePkg from "@react-router/node";
const { unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } = nodePkg as any;
import { uploadImage } from "~/services/cloudinary.server";

export async function loader({ params }: { params: { id: string } }) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, parseInt(params.id))).limit(1);
  if (!post) throw data("Post not found", { status: 404 });
  return { post };
}

export async function action({ request, params }: { request: Request; params: { id: string } }) {
  const id = parseInt(params.id);
  const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  if (!existing) return data({ error: "Not found" }, { status: 404 });
  try {
    let coverImageUrl = "";
    const uploadHandler = unstable_composeUploadHandlers(
      async ({ name, data: fileData }: { name: string; data: any }) => {
        if (name !== "coverImage") return undefined;
        try { coverImageUrl = await uploadImage(fileData, "maison-noir/blog"); return coverImageUrl; } catch { return undefined; }
      },
      unstable_createMemoryUploadHandler()
    );
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    await db.update(blogPosts).set({
      title: formData.get("title") as string,
      slug: slugify(formData.get("title") as string),
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      coverImage: coverImageUrl || existing.coverImage,
      author: (formData.get("author") as string) || "Le Parfume Luxury",
      published: formData.get("published") === "on",
      updatedAt: new Date(),
    }).where(eq(blogPosts.id, id));

    const { cacheClear } = await import("~/utils/cache.server");
    cacheClear();

    return redirect("/admin/blog");
  } catch (error: any) { return { error: error.message }; }
}

export default function AdminBlogEdit() {
  const { post } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl text-cream mb-8">Edit Post</h1>
      <Form method="post" encType="multipart/form-data" className="space-y-6">
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Title *</label>
          <input type="text" name="title" required defaultValue={post.title} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Author</label>
          <input type="text" name="author" defaultValue={post.author || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Excerpt</label>
          <textarea name="excerpt" rows={2} defaultValue={post.excerpt || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none resize-none" />
        </div>
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Content (HTML)</label>
          <textarea name="content" rows={12} defaultValue={post.content || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none resize-none font-mono" />
        </div>
        {post.coverImage && (
          <div>
            <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Current Cover</label>
            <img src={post.coverImage} alt="" className="w-32 h-20 object-cover rounded-sm" />
          </div>
        )}
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Replace Cover (optional)</label>
          <input type="file" name="coverImage" accept="image/*" className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream-muted text-sm file:mr-4 file:px-4 file:py-2 file:bg-gold file:text-noir-bg file:border-0 file:text-sm file:cursor-pointer" />
        </div>
        <div className="border-t border-noir-border pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="published" defaultChecked={post.published || false} className="w-4 h-4 accent-gold" />
            <span className="text-sm text-cream-muted">Published</span>
          </label>
        </div>
        {actionData?.error && <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{actionData.error}</div>}
        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </Form>
    </div>
  );
}
