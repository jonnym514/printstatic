/* ============================================================
   CartDrawer — slide-out cart sidebar
   Opens when clicking the cart icon in the Navbar.
   ============================================================ */

import { X, ShoppingCart, Trash2, Package, ArrowRight, Star, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeFromCart, totalPrice, totalItems } = useCart();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Fetch loyalty balance for logged-in users
  const { data: loyalty } = trpc.loyalty.getBalance.useQuery(undefined, {
    enabled: isAuthenticated && open,
  });

  const handleCheckout = () => {
    onClose();
    navigate("/cart");
  };

  // Points earned from this cart (1 point per $1 spent)
  const pointsToEarn = Math.floor(totalPrice);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your Cart
            </span>
            {totalItems > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loyalty Points Banner — shown only for logged-in users */}
        {isAuthenticated && loyalty && (
          <div
            className="mx-4 mt-3 rounded-lg px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: loyalty.tierColor + "22", border: `1px solid ${loyalty.tierColor}44` }}>
                <Star className="w-4 h-4" style={{ color: loyalty.tierColor }} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {loyalty.points.toLocaleString()} pts
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: loyalty.tierColor + "33", color: loyalty.tierColor, fontFamily: "'Space Mono', monospace" }}
                  >
                    {loyalty.tier}
                  </span>
                </div>
                {loyalty.nextTier && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {loyalty.pointsToNextTier} pts to {loyalty.nextTier}
                  </p>
                )}
              </div>
            </div>
            {totalPrice > 0 && (
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-gray-400">This order earns</p>
                <p className="text-xs font-bold" style={{ color: loyalty.tierColor }}>
                  +{pointsToEarn} pts
                </p>
              </div>
            )}
          </div>
        )}

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Browse the shop to find something you love.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { onClose(); navigate("/shop"); }}>
                Browse Shop
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group">
                {/* Product image */}
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {item.packQty === 1
                        ? "Single copy"
                        : item.packQty === 25
                        ? "Gift Pack (25×)"
                        : `${item.packQty}-Pack`}
                    </span>
                    {item.colorTheme && (
                      <span className="text-xs text-muted-foreground">· {item.colorTheme}</span>
                    )}
                    {item.paperSize && (
                      <span className="text-xs text-muted-foreground">· {item.paperSize}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-primary mt-1">
                    ${item.linePrice.toFixed(2)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={`Remove ${item.product.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — order summary + checkout */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3 bg-white">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-foreground">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Points earned preview */}
            {isAuthenticated && pointsToEarn > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500" />
                  Points earned
                </span>
                <span className="font-semibold text-amber-600">+{pointsToEarn} pts</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Taxes and discounts calculated at checkout.
            </p>

            {/* Checkout CTA */}
            <Button
              className="w-full gap-2 font-semibold"
              onClick={handleCheckout}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Review & Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* View full cart */}
            <button
              onClick={() => { onClose(); navigate("/cart"); }}
              className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center py-1 flex items-center justify-center gap-1"
            >
              View full cart <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
