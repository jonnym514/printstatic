/* ============================================================
   Print Static — Navbar
   White studio. Ink black brand mark. Cyan accent on hover.
   ============================================================ */

import { Link, useLocation } from "wouter";
import { ShoppingCart, Zap, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useMarketing } from "@/contexts/MarketingContext";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/_core/hooks/useAuth";
import StaticNoise from "@/components/StaticNoise";

export default function Navbar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { totalItems } = useCart();
  const { posts, emailCampaigns } = useMarketing();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const pendingCount =
    posts.filter((p) => p.status === "pending_approval").length +
    emailCampaigns.filter((e) => e.status === "pending_approval").length;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/bundles", label: "Bundles" },
    { href: "/rewards", label: "Rewards" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        {/* Static noise accent bar — full-width, very thin, teal-tinted */}
        <div className="relative w-full h-[18px] overflow-hidden bg-foreground">
          <div className="absolute inset-0" style={{ mixBlendMode: "screen" }}>
            <StaticNoise width={1400} height={18} opacity={0.55} className="w-full h-full" />
          </div>
          {/* Teal colour wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "oklch(0.55 0.18 195 / 0.45)", mixBlendMode: "color" }}
          />
        </div>
        <div className="container flex items-center justify-between h-16">

          {/* Brand mark */}
          <Link href="/">
            <div className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/printstatic-icon_ae7caa48.webp"
                alt="Print Static"
                className="h-10 w-10 object-contain rounded-sm"
              />
              <span
                className="hidden sm:block text-sm font-bold tracking-widest text-foreground uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.12em" }}
              >
                Print_Static
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`nav-link text-sm font-medium transition-colors ${
                    location === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Agent Dashboard — admin only */}
            {isAdmin && (
              <Link href="/agent">
                <button
                  className="relative hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 transition-all bg-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Agent
                </button>
              </Link>
            )}

            {/* Cart — opens drawer */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            {isAdmin && (
              <Link href="/agent">
                <span
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Agent Dashboard
                </span>
              </Link>
            )}
            <Link href="/referral">
              <span
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Refer a Friend
              </span>
            </Link>
          </div>
        )}
      </header>

      {/* Cart Drawer — rendered outside header to avoid z-index issues */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
