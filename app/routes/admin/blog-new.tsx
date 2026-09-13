import { Form, redirect, useNavigation, useActionData } from "react-router";
import { db } from "~/db";
import { blogPosts } from "~/db/schema";
import { slugify } from "~/utils/misc";
import * as nodePkg from "@react-router/node";
const { unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } = nodePkg as any;
import { uploadImage } from "~/services/cloudinary.server";

export async function action({ request }: { request: Request }) {
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
    await db.insert(blogPosts).values({
      title: formData.get("title") as string,
      slug: slugify(formData.get("title") as string),
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      coverImage: coverImageUrl || null,
      author: (formData.get("author") as string) || "Le Parfume Luxury",
      published: formData.get("published") === "on",
    });

    const { cacheClear } = await import("~/utils/cache.server");
    cacheClear();

    return redirect("/admin/blog");
  } catch (error: any) { return { error: error.message || "Failed to create post" }; }
}

export default function AdminBlogNew() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl text-cream mb-8">New Blog Post</h1>
      <Form method="post" encType="multipart/form-data" className="space-y-6">
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Title *</label>
          <input type="text" name="title" required className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none" placeholder="The Art of Oud" />
        </div>
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Author</label>
          <input type="text" name="author" defaultValue="Le Parfume Luxury" className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Excerpt</label>
          <textarea name="excerpt" rows={2} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none resize-none" placeholder="A brief summary..." />
        </div>
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Content (HTML)</label>
          <textarea name="content" rows={12} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none resize-none font-mono" placeholder="<p>Your content here...</p>" />
        </div>
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Cover Image</label>
          <input type="file" name="coverImage" accept="image/*" className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream-muted text-sm file:mr-4 file:px-4 file:py-2 file:bg-gold file:text-noir-bg file:border-0 file:text-sm file:cursor-pointer" />
        </div>
        <div className="border-t border-noir-border pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="published" className="w-4 h-4 accent-gold" />
            <span className="text-sm text-cream-muted">Published</span>
          </label>
        </div>
        {actionData?.error && <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{actionData.error}</div>}
        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all disabled:opacity-50">
          {isSubmitting ? "Creating..." : "Create Post"}
        </button>
      </Form>
    </div>
  );
}
