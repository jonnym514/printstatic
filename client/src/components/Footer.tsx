/* ============================================================
   Print Static — Footer
   Ink black band for contrast balance against white pages
   ============================================================ */

import { Link } from "wouter";
import { Download, Mail, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="ink-section mt-24">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-0 mb-4">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/printstatic-logo_edfce887.webp"
                alt="Print Static"
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Digital-first downloads for creators, planners, and makers. Rendered instantly. Print anywhere.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <a href="#" className="p-2 border border-white/10 rounded-sm text-white/40 hover:text-primary hover:border-primary/40 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-white/10 rounded-sm text-white/40 hover:text-primary hover:border-primary/40 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-white/10 rounded-sm text-white/40 hover:text-primary hover:border-primary/40 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4
              className="mono-label mb-5 text-primary"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              /shop
            </h4>
            <ul className="space-y-3">
              {["Planners", "Wall Art", "Templates", "All Products"].map((item) => (
                <li key={item}>
                  <Link href="/shop">
                    <span className="text-sm text-white/50 hover:text-primary transition-colors">
                      {item}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4
              className="mono-label mb-5 text-primary"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              /info
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/faq">
                  <span className="text-sm text-white/50 hover:text-primary transition-colors cursor-pointer">FAQ</span>
                </Link>
              </li>
              <li>
                <Link href="/refund-policy">
                  <span className="text-sm text-white/50 hover:text-primary transition-colors cursor-pointer">Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="text-sm text-white/50 hover:text-primary transition-colors cursor-pointer">Terms of Use</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-sm text-white/50 hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/orders">
                  <span className="text-sm text-white/50 hover:text-primary transition-colors cursor-pointer">My Orders</span>
                </Link>
              </li>
              <li>
                <a href="mailto:support@printstatic.com" className="text-sm text-white/50 hover:text-primary transition-colors">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mt-12 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>
            © 2026 PRINT_STATIC — printstatic.com
          </p>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Download className="w-3 h-3 text-primary" />
            <span>Instant digital delivery — no shipping required</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
