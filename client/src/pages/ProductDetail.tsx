/* ============================================================
   Print Static — Enhanced Product Detail Page
   Reviews, wishlist, flash sale pricing, color variants, cross-sell
   ============================================================ */

import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import {
  ArrowLeft, Star, Download, FileText, Check, ShoppingBag,
  Heart, MessageSquare, Shield, Zap, Clock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductById, getProductImage, products, type ColorVariant, type StyleVariant } from "@/lib/products";
import { BUNDLE_CATALOG } from "../../../shared/products";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// ── Star Rating Input ─────────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Flash Sale Countdown ──────────────────────────────────────────────────────
function FlashCountdown({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-amber-600 bg-amber-50 border border-amber-200 rounded-sm px-3 py-1.5">
      <Clock className="w-3.5 h-3.5" />
      <span>Flash sale ends in: <strong>{timeLeft}</strong></span>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: { userName?: string | null; rating: number; title?: string | null; body?: string | null; verified: boolean; createdAt: Date } }) {
  return (
    <div className="border border-border rounded-sm p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground">{review.userName ?? "Anonymous"}</span>
            {review.verified && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">Verified</Badge>
            )}
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      {review.title && <p className="font-semibold text-sm text-foreground mt-2 mb-1">{review.title}</p>}
      {review.body && <p className="text-sm text-foreground/70 leading-relaxed">{review.body}</p>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<number>(1);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const paperSizes = [
    { id: "us-letter", label: "US Letter", dims: "8.5 × 11 in" },
    { id: "a4", label: "A4", dims: "210 × 297 mm" },
    { id: "a5", label: "A5", dims: "148 × 210 mm" },
  ];

  // tRPC queries
  const { data: reviewsData, refetch: refetchReviews } = trpc.reviews.getReviews.useQuery(
    { productId: id ?? "" },
    { enabled: !!id }
  );
  const { data: reviewStats } = trpc.reviews.getStats.useQuery(
    { productId: id ?? "" },
    { enabled: !!id }
  );
  const { data: activeSales } = trpc.flashSales.getActive.useQuery();
  const { data: wishlistCheck, refetch: refetchWishlist } = trpc.wishlist.check.useQuery(
    { productId: id ?? "" },
    { enabled: !!id && isAuthenticated }
  );

  const submitReview = trpc.reviews.submitReview.useMutation({
    onSuccess: () => {
      toast.success("Review submitted!");
      setReviewDialogOpen(false);
      refetchReviews();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      toast.success(data.wishlisted ? "Added to wishlist" : "Removed from wishlist");
      refetchWishlist();
    },
    onError: () => toast.error("Please sign in to use your wishlist"),
  });

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container flex-1 flex flex-col items-center justify-center py-24">
          <p className="text-xs font-mono text-muted-foreground mb-4">// error: file_not_found</p>
          <h2 className="text-3xl font-bold text-foreground mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Product Not Found
          </h2>
          <Link href="/shop">
            <Button variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine flash sale discount for this product
  const activeSale = activeSales?.find((s) =>
    s.productIds.includes("ALL") || s.productIds.includes(product.id)
  );
  const displayPrice = activeSale
    ? product.price * (1 - activeSale.discountPercent / 100)
    : (product as any).salePrice ?? product.price;
  const originalPrice = product.price;
  const isOnSale = displayPrice < originalPrice;

  const handleAddToCart = () => {
    // Require variant selections if the product has them
    if (product.colorVariants?.length && !selectedColor) {
      toast.error("Please select a color theme");
      return;
    }
    if (product.styleVariants?.length && !selectedStyle) {
      toast.error("Please select a style");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a paper size");
      return;
    }
    const paperSizeLabel = paperSizes.find(s => s.id === selectedSize)?.label;
    addToCart(product, selectedPack, packPrice, selectedColor || undefined, selectedStyle || undefined, paperSizeLabel || undefined);
    const variantNote = [selectedColor, selectedStyle, selectedSize ? paperSizes.find(s => s.id === selectedSize)?.label : null, selectedPack > 1 ? `${selectedPack}-copy pack` : null].filter(Boolean).join(" · ");
    toast.success(`"${product.name}" added to cart`, {
      description: variantNote ? `${variantNote} · Instant download after checkout` : "Instant download after checkout",
      icon: <Download className="w-4 h-4" />,
    });
  };

  // Pack pricing tiers
  const packTiers = [
    { qty: 1, label: "Single", description: "1 copy", discount: 0 },
    { qty: 5, label: "5-Pack", description: "5 copies", discount: 15 },
    { qty: 10, label: "10-Pack", description: "10 copies", discount: 25 },
    { qty: 25, label: "Gift Pack", description: "25 copies · gift/class", discount: 30 },
  ];
  const packPrice = (() => {
    const tier = packTiers.find(t => t.qty === selectedPack);
    if (!tier || tier.discount === 0) return displayPrice * selectedPack;
    return displayPrice * selectedPack * (1 - tier.discount / 100);
  })();
  const packPricePerCopy = packPrice / selectedPack;

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const avgRating = reviewStats?.average ?? 0;
  const reviewCount = reviewStats?.count ?? 0;
  const isWishlisted = wishlistCheck?.wishlisted ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8 font-mono">
          <Link href="/shop"><span className="hover:text-primary transition-colors cursor-pointer">/shop</span></Link>
          <span>/</span>
          <span className="text-primary">{product.category}</span>
          <span>/</span>
          <span className="text-foreground truncate max-w-xs">{product.id}</span>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 mb-20">
          {/* Left: Image */}
          <div className="relative">
            {/* Product image — swaps to variant-specific image when a color is selected */}
            <div className="rounded-sm overflow-hidden bg-muted border border-border shadow-md relative">
              <img
                key={`${selectedColor ?? ""}-${selectedStyle ?? ""}-${activePreview ?? ""}`}
                src={activePreview ?? getProductImage(product, selectedColor ?? undefined, selectedStyle ?? undefined)}
                alt={
                  selectedColor
                    ? `${product.name} — ${product.colorVariants?.find((c: ColorVariant) => c.id === selectedColor)?.label}`
                    : selectedStyle
                    ? `${product.name} — ${product.styleVariants?.find((s: StyleVariant) => s.id === selectedStyle)?.label}`
                    : product.name
                }
                className="w-full max-h-[500px] object-contain transition-opacity duration-300"
              />
              {/* Color label badge */}
              {selectedColor && !activePreview && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1 rounded-full">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0"
                    style={{ backgroundColor: product.colorVariants?.find((c: ColorVariant) => c.id === selectedColor)?.hex }}
                  />
                  {product.colorVariants?.find((c: ColorVariant) => c.id === selectedColor)?.label}
                </div>
              )}
            </div>
            {/* Preview thumbnail strip */}
            {(product as any).previewImages && (product as any).previewImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {/* Main image thumb */}
                <button
                  onClick={() => setActivePreview(null)}
                  className={`w-16 h-16 rounded-sm border-2 overflow-hidden flex-shrink-0 transition-all ${
                    !activePreview ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={getProductImage(product, selectedColor ?? undefined, selectedStyle ?? undefined)} alt="Main" className="w-full h-full object-cover" />
                </button>
                {((product as any).previewImages as string[]).map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActivePreview(img)}
                    className={`w-16 h-16 rounded-sm border-2 overflow-hidden flex-shrink-0 transition-all ${
                      activePreview === img ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {isOnSale && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-sm">
                {activeSale ? `-${activeSale.discountPercent}% FLASH SALE` : "SALE"}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <p className="text-xs font-mono text-muted-foreground mb-3">/{product.category}</p>
            <h1
              className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
            >
              {product.name}
            </h1>

            {/* Rating & Downloads */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.floor(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {avgRating > 0 ? avgRating.toFixed(1) : "No ratings yet"}
                {reviewCount > 0 && ` · ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`}
                
              </span>
            </div>

            {/* Flash sale countdown */}
            {activeSale && <div className="mb-4"><FlashCountdown endsAt={activeSale.endsAt} /></div>}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ${displayPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-xl text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
              )}
              <span className="text-xs text-muted-foreground font-mono">one_time_purchase</span>
            </div>

            {/* Description */}
            <p className="text-base text-foreground/80 leading-relaxed mb-8">{(product as any).longDescription ?? product.description}</p>

            {/* File Details */}
            <div className="bg-muted border border-border rounded-sm p-5 mb-8">
              <h3 className="text-xs font-mono text-muted-foreground mb-4">// what's included</h3>
              <div className="grid grid-cols-2 gap-3">
                {(product as any).pages && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{(product as any).pages} pages</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Instant download</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{(product as any).fileFormat ?? "PDF"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">Unlimited prints</span>
                </div>
              </div>
            </div>

            {/* Color Variants */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Color Theme</h3>
                  {selectedColor && (
                    <span className="text-xs text-primary font-mono">
                      {product.colorVariants.find((c: ColorVariant) => c.id === selectedColor)?.label}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colorVariants.map((c: ColorVariant) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.label}
                      onClick={() => setSelectedColor(c.id)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        selectedColor === c.id
                          ? "border-primary ring-2 ring-primary ring-offset-2 scale-110"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Style Variants */}
            {product.styleVariants && product.styleVariants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Style</h3>
                  {selectedStyle && (
                    <span className="text-xs text-primary font-mono">
                      {product.styleVariants.find((s: StyleVariant) => s.id === selectedStyle)?.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {product.styleVariants.map((s: StyleVariant, idx: number) => {
                    const thumbUrl = product.styleImages?.[s.id];
                    const isSelected = selectedStyle === s.id;
                    const isFirst = idx === 0;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStyle(s.id)}
                        className={`group relative text-left rounded-sm border overflow-hidden transition-all focus:outline-none ${
                          isSelected
                            ? "border-primary ring-2 ring-primary ring-offset-1"
                            : "border-border hover:border-primary/60"
                        }`}
                      >
                        {/* Thumbnail */}
                        {thumbUrl ? (
                          <div className="w-full aspect-[4/3] overflow-hidden bg-muted">
                            <img
                              src={thumbUrl}
                              alt={s.label}
                              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground font-mono">no preview</span>
                          </div>
                        )}
                        {/* Most Popular badge — top-right corner of thumbnail */}
                        {isFirst && (
                          <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-tight pointer-events-none">
                            Most Popular
                          </span>
                        )}
                        {/* Label row */}
                        <div className={`px-2.5 py-2 ${
                          isSelected ? "bg-primary/5" : "bg-background"
                        }`}>
                          <span className={`font-bold block text-xs ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {s.label}
                          </span>
                          <span className="text-muted-foreground font-normal text-[10px] leading-tight">{s.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Print Pack Quantity Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Print Pack</h3>
                {selectedPack > 1 && (
                  <span className="text-xs text-primary font-mono">
                    ${packPricePerCopy.toFixed(2)}/copy
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {packTiers.map((tier) => {
                  const tierTotal = displayPrice * tier.qty * (1 - tier.discount / 100);
                  return (
                    <button
                      key={tier.qty}
                      type="button"
                      onClick={() => setSelectedPack(tier.qty)}
                      className={`flex-1 flex flex-col items-center justify-center px-2 py-3 rounded-sm border text-xs transition-all focus:outline-none relative ${
                        selectedPack === tier.qty
                          ? "border-primary bg-primary/5 text-primary font-bold"
                          : "border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {tier.discount > 0 && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          -{tier.discount}%
                        </span>
                      )}
                      <span className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{tier.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{tier.description}</span>
                      <span className={`text-[11px] font-bold mt-1 ${
                        selectedPack === tier.qty ? "text-primary" : "text-foreground"
                      }`}>${tierTotal.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
              {selectedPack > 1 && (
                <div className="mt-2 text-xs text-green-600 font-bold text-center" style={{ fontFamily: "'Space Mono', monospace" }}>
                  You save ${(displayPrice * selectedPack - packPrice).toFixed(2)} with the {packTiers.find(t => t.qty === selectedPack)?.label}!
                </div>
              )}
            </div>

            {/* Paper Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Paper Size</h3>
                {selectedSize && (
                  <span className="text-xs text-primary font-mono">
                    {paperSizes.find(s => s.id === selectedSize)?.dims}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {paperSizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size.id)}
                    className={`flex-1 flex flex-col items-center justify-center px-3 py-3 rounded-sm border text-xs transition-all focus:outline-none ${
                      selectedSize === size.id
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {/* Paper icon */}
                    <span
                      className={`block mb-1.5 border rounded-[2px] ${
                        selectedSize === size.id ? "border-primary" : "border-current opacity-50"
                      } ${
                        size.id === "a5" ? "w-4 h-5" : size.id === "a4" ? "w-4 h-[22px]" : "w-[18px] h-[22px]"
                      }`}
                    />
                    <span className="font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{size.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{size.dims}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {(product as any).tags && (
              <div className="flex flex-wrap gap-2 mb-8">
                {(product as any).tags.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 text-xs border border-border rounded-sm text-muted-foreground font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-foreground text-background hover:bg-primary hover:text-white font-bold"
                size="lg"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {(() => {
                  const tier = packTiers.find(t => t.qty === selectedPack);
                  if (!tier || tier.discount === 0) return `Add to Cart — $${packPrice.toFixed(2)}`;
                  const savings = (displayPrice * selectedPack) - packPrice;
                  return `Add ${tier.label} — $${packPrice.toFixed(2)} · Save $${savings.toFixed(2)}`;
                })()}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (!isAuthenticated) { toast.error("Sign in to save to wishlist"); return; }
                  toggleWishlist.mutate({ productId: product.id });
                }}
                className={`border-border ${isWishlisted ? "text-red-500 border-red-300" : "text-foreground"}`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
            </div>

            <Link href="/cart">
              <Button variant="outline" className="w-full mb-6">View Cart</Button>
            </Link>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Shield, label: "Secure Checkout" },
                { icon: Zap, label: "Instant Download" },
                { icon: Check, label: "Unlimited Prints" },
                { icon: Check, label: "No Subscription" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {label}
                </div>
              ))}
            </div>

            {/* Bundle Cross-Sell */}
            {(() => {
              const matchingBundles = BUNDLE_CATALOG.filter(
                (b) => b.bundleProductIds?.includes(product.id)
              );
              if (matchingBundles.length === 0) return null;
              return (
                <div className="border border-green-200 bg-green-50 rounded-sm p-4 mt-4">
                  <p className="text-sm font-bold text-foreground mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Save with a Bundle
                  </p>
                  {matchingBundles.map((bundle) => (
                    <Link key={bundle.id} href={`/bundles#${bundle.id}`}>
                      <div className="flex items-center justify-between py-2 hover:bg-green-100 rounded px-2 -mx-2 transition-colors">
                        <span className="text-sm text-foreground">{bundle.name}</span>
                        <span className="text-xs font-bold text-green-700" style={{ fontFamily: "'Space Mono', monospace" }}>
                          Save ${(bundle.price - (bundle.salePrice ?? bundle.price)).toFixed(2)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-border pt-12 mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2">// customer_reviews</p>
              <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Reviews
                {reviewCount > 0 && (
                  <span className="ml-3 text-lg text-muted-foreground font-normal">
                    {avgRating.toFixed(1)} ★ ({reviewCount})
                  </span>
                )}
              </h2>
            </div>
            {isAuthenticated && (
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" /> Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review: {product.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Rating</label>
                      <StarInput value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title (optional)</label>
                      <input
                        className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                        placeholder="Summarize your experience"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Review (optional)</label>
                      <Textarea
                        placeholder="What did you think of this product?"
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => submitReview.mutate({ productId: product.id, rating: reviewRating, title: reviewTitle || undefined, body: reviewBody || undefined })}
                      disabled={submitReview.isPending}
                    >
                      {submitReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {reviewsData && reviewsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsData.map((r) => <ReviewCard key={r.id} review={r} />)}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-sm">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product.</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <div className="border-t border-border mb-12" />
            <p className="text-xs font-mono text-muted-foreground mb-3">/related_files</p>
            <h2 className="text-3xl font-bold text-foreground mb-8" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} animationDelay={i * 100} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
