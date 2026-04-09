/* ============================================================
   Print Static — Bundles Page
   Curated product bundles with savings highlighted
   ============================================================ */

import { Link } from "wouter";
import { ShoppingBag, Package, Check, Zap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BUNDLE_CATALOG, PRODUCT_CATALOG } from "../../../shared/products";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8";

// Map bundle product IDs to preview images from the main catalog
const PRODUCT_IMAGES: Record<string, string> = {
  "weekly-planner": `${CDN}/ps-w-weekly-planner_0877369e.png`,
  "budget-planner": `${CDN}/ps-w-budget-planner_e6369639.png`,
  "habit-tracker": `${CDN}/ps-w-habit-tracker_92792418.png`,
  "goal-workbook": `${CDN}/ps-w-goal-workbook_1449c526.png`,
  "meal-planner": `${CDN}/ps-w-meal-planner_9c0428d4.png`,
  "journal-bundle": `${CDN}/ps-w-journal-bundle_7050f863.png`,
  "resume-bundle": `${CDN}/ps-w-resume-bundle_66bde203.png`,
  "social-calendar": `${CDN}/ps-w-social-calendar_65cc33ed.png`,
  "social-templates": `${CDN}/ps-w-social-templates_7080890b.png`,
  "notion-template": `${CDN}/ps-w-notion-template_9a5470c0.png`,
  "brand-kit": `${CDN}/ps-w-brand-kit_555ecc08.png`,
  "business-card": `${CDN}/ps-w-business-card_6f5d760a.png`,
  "wall-art-geometric": `${CDN}/ps-w-wall-art-geometric_6bffca36.png`,
  "wall-art-quotes": `${CDN}/ps-w-wall-art-quotes_c4b8c1aa.png`,
};

export default function Bundles() {
  const { addToCart } = useCart();

  const handleAddBundle = (bundle: typeof BUNDLE_CATALOG[0]) => {
    // Add bundle as a single cart item using the shared catalog item
    addToCart({
      id: bundle.id,
      name: bundle.name,
      price: bundle.salePrice ?? bundle.price,
      description: bundle.description,
      category: bundle.category,
    } as any);
    toast.success(`"${bundle.name}" added to cart`, {
      description: `Save $${(bundle.price - (bundle.salePrice ?? bundle.price)).toFixed(2)} with this bundle`,
      icon: <Package className="w-4 h-4" />,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-muted/30">
        <div className="container py-14">
          <p className="text-xs font-mono text-muted-foreground mb-3">// bundle_deals</p>
          <h1
            className="text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Bundle &amp; Save
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Get more for less. Our curated bundles combine best-selling products at up to 33% off the individual prices.
          </p>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {BUNDLE_CATALOG.map((bundle) => {
            const savings = bundle.price - (bundle.salePrice ?? bundle.price);
            const savingsPct = Math.round((savings / bundle.price) * 100);
            const includedProducts = (bundle.bundleProductIds ?? []).map((pid) =>
              PRODUCT_CATALOG.find((p) => p.id === pid)
            ).filter(Boolean);
            const previewImages = (bundle.bundleProductIds ?? [])
              .slice(0, 4)
              .map((pid) => PRODUCT_IMAGES[pid])
              .filter(Boolean);

            return (
              <div
                key={bundle.id}
                className="border border-border rounded-sm overflow-hidden bg-card hover:border-primary/50 transition-colors group"
              >
                {/* Preview image grid */}
                <div className="relative bg-muted h-56 overflow-hidden">
                  <div className="grid grid-cols-2 h-full gap-0.5">
                    {previewImages.slice(0, 4).map((img, i) => (
                      <div key={i} className="overflow-hidden">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-red-500 text-white text-sm font-bold px-3 py-1">
                      Save {savingsPct}%
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground mb-1">
                        /bundles · {includedProducts.length} products
                      </p>
                      <h2
                        className="text-2xl font-bold text-foreground"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {bundle.name}
                      </h2>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        ${(bundle.salePrice ?? bundle.price).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        ${bundle.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/70 mb-5 leading-relaxed">{bundle.description}</p>

                  {/* Included products list */}
                  <div className="bg-muted/50 rounded-sm p-4 mb-5">
                    <p className="text-xs font-mono text-muted-foreground mb-3">// includes</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {includedProducts.map((p) => p && (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="text-foreground">{p.name}</span>
                          </div>
                          <span className="text-muted-foreground font-mono text-xs">${p.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border mt-3 pt-3 flex justify-between text-sm font-semibold">
                      <span className="text-muted-foreground">If bought separately:</span>
                      <span className="text-foreground line-through">${bundle.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold mt-1">
                      <span className="text-primary">Bundle price:</span>
                      <span className="text-primary">${(bundle.salePrice ?? bundle.price).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-foreground text-background hover:bg-primary hover:text-white font-bold"
                      onClick={() => handleAddBundle(bundle)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add Bundle to Cart
                    </Button>
                  </div>

                  {/* Savings callout */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-green-600 font-mono">
                    <Zap className="w-3.5 h-3.5" />
                    You save ${savings.toFixed(2)} vs buying individually
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA to shop */}
        <div className="text-center mt-16 py-12 border border-dashed border-border rounded-sm">
          <p className="text-xs font-mono text-muted-foreground mb-3">// browse_individual</p>
          <h3 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Looking for individual products?
          </h3>
          <p className="text-muted-foreground mb-6">Browse our full catalog of 17+ premium printable downloads.</p>
          <Link href="/shop">
            <Button variant="outline" size="lg">
              Browse All Products <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
