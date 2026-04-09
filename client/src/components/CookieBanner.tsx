/**
 * Print Static — Cookie Consent Banner
 * Shown on first visit. Stores consent in localStorage.
 * Links to /privacy for full details.
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "ps_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user hasn't already made a choice
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      // Small delay so it doesn't flash immediately on page load
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-sm shadow-lg p-4 md:p-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="shrink-0 w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center mt-0.5">
            <Cookie className="w-4 h-4 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">
              We use cookies
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use essential cookies to keep you logged in and remember your cart, plus optional
              analytics cookies to improve the site. No personal data is sold to third parties.{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={decline}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            aria-label="Dismiss cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 ml-11">
          <Button
            size="sm"
            onClick={accept}
            className="text-xs h-7 px-3"
          >
            Accept All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={decline}
            className="text-xs h-7 px-3"
          >
            Essential Only
          </Button>
        </div>
      </div>
    </div>
  );
}
