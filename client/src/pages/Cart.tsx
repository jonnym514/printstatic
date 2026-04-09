/* ============================================================
   Print Static — Cart Page
   White layout. Ink black summary panel. Cyan accents.
   ============================================================ */

import { Link } from "wouter";
import { Trash2, Download, ArrowRight, ShoppingCart, ArrowLeft, Lock, Loader2, Tag, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function Cart() {
  const { items, removeFromCart, totalPrice, totalItems, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  // Simple client-side promo validation — real validation happens in Stripe checkout
  const DEMO_PROMOS: Record<string, number> = {
    WELCOME10: 10,
    SAVE20: 20,
    BUNDLE30: 30,
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError("");
    setTimeout(() => {
      const discount = DEMO_PROMOS[code];
      if (discount) {
        setAppliedPromo({ code, discount });
        toast.success(`Promo code applied! ${discount}% off`, { description: `Code "${code}" will be applied at checkout.` });
      } else {
        setPromoError("Invalid promo code. Try WELCOME10, SAVE20, or BUNDLE30.");
        setAppliedPromo(null);
      }
      setPromoLoading(false);
    }, 600);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const discountAmount = appliedPromo ? (totalPrice * appliedPromo.discount) / 100 : 0;
  const finalTotal = totalPrice - discountAmount;

  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      window.open(url, "_blank");
      toast.success("Opening secure checkout…", {
        description: "Complete payment in the new tab to receive your files.",
      });
    },
    onError: (err) => {
      toast.error("Checkout error", {
        description: err.message ?? "Please try again.",
      });
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) return;
    const productIds = items.map((i) => i.product.id);
    checkoutMutation.mutate({
      productIds,
      origin: window.location.origin,
      // Pass the applied promo code so Stripe can pre-apply it
      promoCode: appliedPromo?.code,
      // Pass pack details so Stripe shows correct names, quantities, and prices
      packDetails: items.map((i) => ({
        productId: i.product.id,
        packQty: i.packQty ?? 1,
        linePrice: i.linePrice ?? i.product.price,
        colorTheme: i.colorTheme,
        styleVariant: i.styleVariant,
        paperSize: i.paperSize,
      })),
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container flex-1 flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 border border-border rounded-sm flex items-center justify-center mb-6 bg-muted">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p
            className="mono-label mb-3"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            cart_empty
          </p>
          <h2
            className="text-4xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Nothing in your cart yet.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm text-sm">
            Browse the catalog and add files to your cart. Instant delivery after checkout.
          </p>
          <Link href="/shop">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-foreground text-background rounded-sm hover:bg-primary hover:text-white transition-all"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Browse File Catalog
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="ink-section py-10">
        <div className="container flex items-center justify-between">
          <div>
            <p
              className="mono-label mb-2 text-primary"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              /cart — download_queue
            </p>
            <h1
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
            >
              Your Cart
            </h1>
          </div>
          <span
            className="text-xs text-white/40"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {totalItems} file{totalItems !== 1 ? "s" : ""}
          </span>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-5 border border-border rounded-sm p-5 bg-white shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
              >
                {/* Product Image */}
                <div className="w-20 h-20 rounded-sm overflow-hidden bg-muted flex-shrink-0 border border-border">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p
                    className="mono-label mb-1"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    /{item.product.category.toLowerCase().replace(/\s+/g, "_")}
                  </p>
                  <Link href={`/product/${item.product.id}`}>
                    <h3
                      className="text-base font-bold text-foreground hover:text-primary transition-colors leading-snug mb-1"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground" style={{ fontFamily: "'Space Mono', monospace" }}>
                    <Download className="w-3 h-3 text-primary" />
                    <span>instant_dl · {item.product.fileFormat}{item.packQty > 1 ? ` · ${item.packQty}-copy pack` : ""}</span>
                  </div>
                </div>

                {/* Price + Remove */}
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right">
                    <span
                      className="text-lg font-bold text-primary block"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      ${item.linePrice.toFixed(2)}
                    </span>
                    {item.packQty > 1 && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ${(item.linePrice / item.packQty).toFixed(2)}/copy
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-1">
              <button
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                clear_cart()
              </button>
            </div>
          </div>

          {/* Order Summary — ink black panel */}
          <div className="lg:col-span-1">
            <div className="ink-section rounded-sm p-6 sticky top-20">
              <p
                className="mono-label mb-4 text-primary"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                order_summary
              </p>

              <div className="space-y-2.5 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-white/50 truncate mr-4">
                      {item.product.name}{item.packQty > 1 ? ` ×${item.packQty}` : ""}
                    </span>
                    <span className="font-medium text-white whitespace-nowrap">${item.linePrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-white/10 mb-4" />

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/50">Subtotal</span>
                <span className="font-semibold text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm text-white/50">Shipping</span>
                <span
                  className="text-sm font-bold text-primary"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  $0.00
                </span>
              </div>

              <div className="w-full h-px bg-white/10 mb-5" />

              {/* Promo code input */}
              <div className="mb-4">
                <p className="text-xs text-white/40 mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>promo_code</p>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-sm border border-primary/50 bg-primary/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary" style={{ fontFamily: "'Space Mono', monospace" }}>{appliedPromo.code}</span>
                      <span className="text-xs text-white/50">−{appliedPromo.discount}%</span>
                    </div>
                    <button onClick={handleRemovePromo} className="p-1 text-white/30 hover:text-white/70 transition-colors">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      placeholder="Enter code…"
                      className="flex-1 px-3 py-2 rounded-sm bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="px-3 py-2 rounded-sm bg-white/10 hover:bg-primary/20 text-white text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {promoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
                      Apply
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-400 mt-1.5">{promoError}</p>}
              </div>

              <div className="w-full h-px bg-white/10 mb-4" />

              {appliedPromo && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-primary/80">Discount ({appliedPromo.discount}%)</span>
                  <span className="font-semibold text-primary">−${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <span
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Total
                </span>
                <span
                  className="text-2xl font-bold text-primary"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  ${finalTotal.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm tracking-wide rounded-sm bg-primary text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing checkout…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Secure Checkout
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p
                className="text-xs text-white/30 text-center mt-3"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                encrypted · powered by Stripe
              </p>

              {/* Test mode notice */}
              <div className="mt-4 p-3 border border-primary/30 rounded-sm bg-primary/10">
                <p
                  className="text-xs text-primary font-bold mb-0.5"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  // test_mode: active
                </p>
                <p className="text-xs text-white/50">
                  Card: <span className="font-mono text-primary">4242 4242 4242 4242</span> · any future date · any CVC
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10">
                <Link href="/shop">
                  <button
                    className="w-full text-xs text-white/30 hover:text-primary transition-colors flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    continue_browsing()
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
