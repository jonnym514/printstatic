/* ============================================================
   Print Static — ProductCard
   White card, ink black text, cyan accent on hover
   ============================================================ */

import { Link } from "wouter";
import { Download } from "lucide-react";
import { Product } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const MAX_SWATCHES = 6;

interface ProductCardProps {
  product: Product;
  animationDelay?: number;
  liveStats?: { avg: number; count: number };
}

export default function ProductCard({ product, animationDelay = 0, liveStats }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`"${product.name}" added to cart`, {
      description: "Instant delivery after checkout",
      icon: <Download className="w-4 h-4" />,
    });
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className="product-card border border-border rounded-sm overflow-hidden group fade-up bg-white shadow-sm"
        style={{ animationDelay: `${animationDelay}ms`, animationFillMode: "both" }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className="badge-cyan">{product.badge}</span>
            </div>
          )}
          <div
            className="absolute bottom-3 right-3 px-2 py-0.5 bg-white/95 border border-border rounded-sm text-xs text-primary font-bold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            .PDF
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p
                className="mono-label mb-1.5"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                /{product.category.toLowerCase().replace(/\s+/g, "_")}
              </p>
              <h3
                className="text-base font-bold leading-snug text-foreground truncate"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {product.name}
              </h3>
            </div>
            <span
              className="text-lg font-bold text-primary whitespace-nowrap"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ${product.price.toFixed(2)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Info row */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {liveStats && liveStats.count > 0 ? `★ ${liveStats.avg.toFixed(1)} · ${liveStats.count} review${liveStats.count !== 1 ? "s" : ""}` : "PDF · print_ready"}
            </span>
            <span className="text-xs text-primary/70" style={{ fontFamily: "'Space Mono', monospace" }}>
              instant_dl
            </span>
          </div>

          {/* Color swatches */}
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4">
              {product.colorVariants.slice(0, MAX_SWATCHES).map((cv) => (
                <span
                  key={cv.id}
                  title={cv.label}
                  className="w-5 h-5 rounded-full border border-border flex-shrink-0 transition-transform duration-150 hover:scale-125"
                  style={{ backgroundColor: cv.hex }}
                />
              ))}
              {product.colorVariants.length > MAX_SWATCHES && (
                <span
                  className="text-[10px] text-muted-foreground"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  +{product.colorVariants.length - MAX_SWATCHES}
                </span>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2 bg-foreground text-background rounded-sm hover:bg-primary hover:text-white transition-all duration-200"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Download className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
