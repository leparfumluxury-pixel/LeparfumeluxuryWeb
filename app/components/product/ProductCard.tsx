import { Link } from "react-router";
import type { Product } from "~/db/schema";
import { formatPrice } from "~/utils/misc";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0] || "/placeholder-product.jpg";

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block"
      id={`product-card-${product.slug}`}
    >
      <div className="relative overflow-hidden bg-noir-surface rounded-sm aspect-[3/4]">
        {/* Product Image */}
        <div className="product-image-container w-full h-full">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Quick View Badge */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <span className="inline-block text-xs tracking-[0.2em] uppercase text-gold">
            Discover →
          </span>
        </div>

        {/* Compare Price Badge */}
        {product.comparePrice && product.comparePrice > product.price && (
          <div className="absolute top-4 left-4">
            <span className="text-xs tracking-wider uppercase bg-gold/90 text-noir-bg px-3 py-1">
              Sale
            </span>
          </div>
        )}

        {/* Border glow on hover */}
        <div className="absolute inset-0 border border-transparent group-hover:border-gold/20 transition-colors duration-500 rounded-sm" />
      </div>

      {/* Product Info */}
      <div className="mt-5 space-y-2">
        <h3 className="font-heading text-xl text-cream group-hover:text-gold transition-colors duration-300">
          {product.name}
        </h3>
        {product.category && (
          <p className="text-xs tracking-[0.2em] uppercase text-cream-dark">
            {product.category}
          </p>
        )}
        <div className="flex items-center gap-3">
          <span className="text-sm tracking-wider text-cream-muted">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm tracking-wider text-cream-dark line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
