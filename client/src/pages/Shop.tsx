/* ============================================================
   Print Static — Shop Page
   White grid. Ink black header. Cyan filter accents.
   ============================================================ */

import { useState, useMemo } from "react";
import { Shield, Zap, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { trpc } from "@/lib/trpc";
import {
  categories,
  styleFilters,
  getProductsByCategory,
  getProductsByStyle,
} from "@/lib/products";

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStyle, setActiveStyle] = useState("all");

  const byCategory = getProductsByCategory(activeCategory);
  const filtered = getProductsByStyle(byCategory, activeStyle);

  // Collect all product IDs for batch review stats
  const productIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const { data: reviewStats } = trpc.reviews.getStatsBatch.useQuery(
    { productIds },
    { enabled: productIds.length > 0 }
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Page Header — ink black band */}
      <section className="ink-section py-14">
        <div className="container">
          <p
            className="mono-label mb-3 text-primary"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            /shop — all_files
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1
              className="text-5xl md:text-6xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}
            >
              File Catalog
            </h1>
            <p
              className="text-sm text-white/40"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {filtered.length} file{filtered.length !== 1 ? "s" : ""} · instant_download · no_shipping
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container py-6 border-b border-border space-y-4">
        {/* Category row */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-all duration-200 border ${
                activeCategory === cat.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Style row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[10px] text-muted-foreground uppercase tracking-widest mr-1"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Style:
          </span>
          {styleFilters.map((sf) => (
            <button
              key={sf.id}
              onClick={() => setActiveStyle(sf.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all duration-200 border ${
                activeStyle === sf.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/60 hover:text-primary"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </section>

      {/* Trust Strip */}
      <section className="container py-3 flex items-center justify-center gap-6 text-xs text-muted-foreground border-b border-border">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" /> Secure Checkout
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" /> Instant Download
        </span>
        <span className="flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-primary" /> Unlimited Prints
        </span>
      </section>

      {/* Product Grid */}
      <section className="container py-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} animationDelay={i * 60} liveStats={reviewStats?.[product.id]} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 border border-border rounded-sm bg-muted">
            <p
              className="text-muted-foreground text-sm"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              // no files match this filter combination
            </p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveStyle("all"); }}
              className="mt-4 text-xs text-primary underline underline-offset-2"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              clear filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
