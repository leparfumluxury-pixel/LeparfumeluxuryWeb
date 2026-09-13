import { Form, redirect, useLoaderData, useNavigation, useActionData, data } from "react-router";
import { db } from "~/db";
import { products } from "~/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "~/utils/misc";
import * as nodePkg from "@react-router/node";
const {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} = nodePkg as any;
import { uploadImage } from "~/services/cloudinary.server";

export async function loader({ params }: { params: { id: string } }) {
  const [product] = await db.select().from(products).where(eq(products.id, parseInt(params.id))).limit(1);
  if (!product) throw data("Product not found", { status: 404 });
  return { product };
}

export async function action({ request, params }: { request: Request; params: { id: string } }) {
  const id = parseInt(params.id);
  const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!existing) return data({ error: "Product not found" }, { status: 404 });

  try {
    const uploadedImages: string[] = [];
    const uploadHandler = unstable_composeUploadHandlers(
      async ({ name, data: fileData }: { name: string; data: any }) => {
        if (name !== "images") return undefined;
        try {
          const url = await uploadImage(fileData, "maison-noir/products");
          uploadedImages.push(url);
          return url;
        } catch { return undefined; }
      },
      unstable_createMemoryUploadHandler()
    );

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Math.round(parseFloat(formData.get("price") as string) * 100);
    const comparePriceRaw = formData.get("comparePrice") as string;
    const comparePrice = comparePriceRaw ? Math.round(parseFloat(comparePriceRaw) * 100) : null;
    const category = formData.get("category") as string;
    const stock = parseInt(formData.get("stock") as string) || 0;
    const featured = formData.get("featured") === "on";
    const published = formData.get("published") === "on";

    const topNotes = (formData.get("topNotes") as string || "").split(",").map((s) => s.trim()).filter(Boolean);
    const middleNotes = (formData.get("middleNotes") as string || "").split(",").map((s) => s.trim()).filter(Boolean);
    const baseNotes = (formData.get("baseNotes") as string || "").split(",").map((s) => s.trim()).filter(Boolean);

    // Keep existing images if no new ones uploaded
    const images = uploadedImages.length > 0 ? uploadedImages : (existing.images as string[]) || [];

    await db.update(products).set({
      name,
      slug: slugify(name),
      description,
      price,
      comparePrice,
      images,
      notes: { top: topNotes, middle: middleNotes, base: baseNotes },
      category: category || null,
      stock,
      featured,
      published,
      updatedAt: new Date(),
    }).where(eq(products.id, id));

    const { cacheClear } = await import("~/utils/cache.server");
    cacheClear();

    return redirect("/admin/products");
  } catch (error: any) {
    return { error: error.message || "Failed to update product" };
  }
}

export default function AdminProductEdit() {
  const { product } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isSubmitting = navigation.state === "submitting";
  const notes = product.notes as { top: string[]; middle: string[]; base: string[] } | null;

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-3xl text-cream mb-8">Edit Product</h1>

      <Form method="post" encType="multipart/form-data" className="space-y-6">
        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Product Name *</label>
          <input type="text" name="name" required defaultValue={product.name} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Description</label>
          <textarea name="description" rows={4} defaultValue={product.description || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Price (₹) *</label>
            <input type="number" name="price" step="0.01" required defaultValue={product.price / 100} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Compare Price (₹)</label>
            <input type="number" name="comparePrice" step="0.01" defaultValue={product.comparePrice ? product.comparePrice / 100 : ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Category</label>
            <select name="category" defaultValue={product.category || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors">
              <option value="">Select category</option>
              <option value="eau-de-parfum">Eau de Parfum</option>
              <option value="eau-de-toilette">Eau de Toilette</option>
              <option value="extrait">Extrait de Parfum</option>
              <option value="collection-privee">Collection Privée</option>
              <option value="travel-size">Travel Size</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Stock</label>
            <input type="number" name="stock" defaultValue={product.stock || 0} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors" />
          </div>
        </div>

        <div className="border-t border-noir-border pt-6">
          <h3 className="font-heading text-xl text-cream mb-4">Fragrance Notes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Top Notes</label>
              <input type="text" name="topNotes" defaultValue={notes?.top?.join(", ") || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Heart Notes</label>
              <input type="text" name="middleNotes" defaultValue={notes?.middle?.join(", ") || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Base Notes</label>
              <input type="text" name="baseNotes" defaultValue={notes?.base?.join(", ") || ""} className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream text-sm focus:border-gold focus:outline-none transition-colors" />
            </div>
          </div>
        </div>

        {/* Existing Images */}
        {product.images && (product.images as string[]).length > 0 && (
          <div>
            <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Current Images</label>
            <div className="flex gap-3">
              {(product.images as string[]).map((img, i) => (
                <div key={i} className="w-16 h-20 bg-noir-muted rounded-sm overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-cream-muted mb-2 tracking-wider uppercase">Replace Images (optional)</label>
          <input type="file" name="images" multiple accept="image/*" className="w-full px-4 py-3 bg-noir-surface border border-noir-border text-cream-muted text-sm file:mr-4 file:px-4 file:py-2 file:bg-gold file:text-noir-bg file:border-0 file:text-sm file:cursor-pointer" />
        </div>

        <div className="flex gap-8 border-t border-noir-border pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="featured" defaultChecked={product.featured || false} className="w-4 h-4 accent-gold" />
            <span className="text-sm text-cream-muted">Featured</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="published" defaultChecked={product.published || false} className="w-4 h-4 accent-gold" />
            <span className="text-sm text-cream-muted">Published</span>
          </label>
        </div>

        {actionData?.error && (
          <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm rounded-sm">{actionData.error}</div>
        )}

        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gold text-noir-bg text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold-light transition-all duration-300 disabled:opacity-50">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </Form>
    </div>
  );
}
