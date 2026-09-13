import { useSearchParams } from "react-router";

interface FilterSidebarProps {
  categories: string[];
  currentCategory?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
}

export function FilterSidebar({
  categories,
  currentCategory,
  currentMinPrice,
  currentMaxPrice,
}: FilterSidebarProps) {
  const [, setSearchParams] = useSearchParams();

  function handleCategoryChange(category: string) {
    setSearchParams((prev) => {
      if (category === "") {
        prev.delete("category");
      } else {
        prev.set("category", category);
      }
      return prev;
    });
  }

  function handlePriceChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchParams((prev) => {
      const min = formData.get("minPrice") as string;
      const max = formData.get("maxPrice") as string;
      if (min) prev.set("minPrice", min);
      else prev.delete("minPrice");
      if (max) prev.set("maxPrice", max);
      else prev.delete("maxPrice");
      return prev;
    });
  }

  return (
    <aside className="space-y-8">
      {/* Category Filter */}
      <div>
        <h4 className="font-heading text-lg text-cream mb-4">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange("")}
            className={`block text-sm transition-colors duration-300 ${
              !currentCategory ? "text-gold" : "text-cream-muted hover:text-cream"
            }`}
          >
            All Fragrances
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`block text-sm transition-colors duration-300 capitalize ${
                currentCategory === cat
                  ? "text-gold"
                  : "text-cream-muted hover:text-cream"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="font-heading text-lg text-cream mb-4">Price Range</h4>
        <form onSubmit={handlePriceChange} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="number"
              name="minPrice"
              placeholder="Min ₹"
              defaultValue={currentMinPrice}
              className="w-full px-3 py-2 bg-noir-surface border border-noir-border rounded-sm text-sm text-cream placeholder:text-cream-dark focus:border-gold focus:outline-none transition-colors"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max ₹"
              defaultValue={currentMaxPrice}
              className="w-full px-3 py-2 bg-noir-surface border border-noir-border rounded-sm text-sm text-cream placeholder:text-cream-dark focus:border-gold focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-xs tracking-[0.2em] uppercase border border-gold/30 text-gold hover:bg-gold hover:text-noir-bg transition-all duration-300"
          >
            Apply
          </button>
        </form>
      </div>
    </aside>
  );
}
