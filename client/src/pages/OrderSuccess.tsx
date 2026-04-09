/* ============================================================
   Print Static — Order Success Page
   White layout. Ink black confirmation header. Cyan accents.
   Uses the public getDownloadLinksForSession endpoint so
   customers can download immediately — no login required.
   ============================================================ */

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  CheckCircle2, Download, ArrowRight, Home, Mail,
  Loader2, AlertCircle, Package, Star, Trophy,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function OrderSuccess() {
  const [location] = useLocation();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const sessionId = params.get("session_id") ?? "";

  // Track polling attempts for webhook delay
  const [pollCount, setPollCount] = useState(0);

  // Clear cart on mount
  useEffect(() => {
    clearCart();
  }, []);

  // ── Public endpoint: validate via session_id — no login required ──
  const {
    data: sessionData,
    isLoading: sessionLoading,
    refetch,
  } = trpc.files.getDownloadLinksForSession.useQuery(
    { sessionId },
    {
      enabled: !!sessionId,
      // Retry up to 5 times with 3s delay to handle webhook processing lag
      retry: 5,
      retryDelay: 3000,
    }
  );

  // If order not ready yet (webhook hasn't fired), poll every 3s up to 5 times
  useEffect(() => {
    if (!sessionData) return;
    if (sessionData.ready) return;
    if (pollCount >= 5) return;
    const timer = setTimeout(() => {
      setPollCount((c) => c + 1);
      refetch();
    }, 3000);
    return () => clearTimeout(timer);
  }, [sessionData, pollCount, refetch]);

  const isLoading = sessionLoading;
  const hasLinks = sessionData?.ready && sessionData.files.length > 0;
  const noFilesUploaded = sessionData?.ready && sessionData.files.length === 0;
  const webhookPending = sessionData && !sessionData.ready && pollCount < 5;
  const webhookTimedOut = sessionData && !sessionData.ready && pollCount >= 5;

  // ── Loyalty (only when logged in) ──
  const { data: loyalty } = trpc.loyalty.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: orders } = trpc.stripe.getOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const thisOrder = orders?.find((o) => o.stripeSessionId === sessionId);
  const pointsEarned = thisOrder ? Math.floor((thisOrder.amountTotal ?? 0) / 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Confirmation Header — ink black band */}
      <section className="ink-section py-12">
        <div className="container text-center">
          <div className="w-14 h-14 border border-primary/40 rounded-sm flex items-center justify-center mx-auto mb-5 bg-primary/10">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <p
            className="mono-label mb-3 text-primary"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            payment_status: confirmed ✓
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Files are ready.
          </h1>
          <p className="text-white/50 text-base max-w-md mx-auto">
            Transaction processed. Download your files below. A receipt has been sent to your email.
          </p>
          {sessionId && (
            <p
              className="text-xs text-white/30 mt-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ref: {sessionId.slice(0, 24)}…
            </p>
          )}
        </div>
      </section>

      <div className="container py-16 flex-1">
        <div className="max-w-2xl mx-auto">

          {/* Download Section */}
          <div className="border border-border rounded-sm p-6 bg-white shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 border border-border rounded-sm flex items-center justify-center bg-muted">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Your Downloads
                </h2>
                <p
                  className="text-xs text-muted-foreground"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  // click any file to download
                </p>
              </div>
            </div>

            {/* Loading / polling state */}
            {(isLoading || webhookPending) && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {webhookPending
                    ? "Processing your order… this takes just a moment."
                    : "Preparing your download links…"}
                </p>
              </div>
            )}

            {/* Webhook timed out — rare edge case */}
            {webhookTimedOut && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <p className="text-sm font-semibold text-foreground">Order is still processing</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Your payment went through! Your files will appear in{" "}
                  <Link href="/orders" className="text-primary underline">Order History</Link>{" "}
                  within a minute. You can also check your email for a download link.
                </p>
              </div>
            )}

            {/* Files not yet uploaded by admin */}
            {noFilesUploaded && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Package className="w-8 h-8 text-primary" />
                <p className="text-sm font-semibold text-foreground">Your files are being prepared</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Your payment was successful! We're finalizing your download files. They'll be available in your{" "}
                  <Link href="/orders" className="text-primary underline">Order History</Link> shortly.
                </p>
              </div>
            )}

            {/* Real download links */}
            {hasLinks && (
              <div className="space-y-2">
                {sessionData.files.map((link) => (
                  <a
                    key={link.fileId}
                    href={link.downloadUrl}
                    download={link.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-border rounded-sm hover:border-primary/40 hover:bg-muted/50 transition-colors group no-underline"
                  >
                    <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold text-foreground leading-snug truncate"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        {link.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">Click to download</p>
                    </div>
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors shrink-0 rounded-sm"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </span>
                  </a>
                ))}
              </div>
            )}

            <div className="mt-5 p-4 border border-primary/20 rounded-sm bg-primary/5">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-sm font-bold text-foreground"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Links also sent to your inbox
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You can re-download your files anytime from your{" "}
                    <Link href="/orders" className="text-primary underline">Order History</Link>.
                    Files are yours to keep — print unlimited copies, forever.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loyalty Points Earned Card — only when logged in */}
          {isAuthenticated && loyalty && pointsEarned > 0 && (
            <div
              className="rounded-sm p-5 mb-6 flex items-center gap-4"
              style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: loyalty.tierColor + "22", border: `2px solid ${loyalty.tierColor}55` }}
              >
                <Star className="w-6 h-6" style={{ color: loyalty.tierColor }} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-mono">// loyalty_points_earned</p>
                <p className="text-xl font-bold text-white mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  +{pointsEarned} points
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  New balance: <span className="text-white font-semibold">{loyalty.points.toLocaleString()} pts</span>
                  {" · "}
                  <span style={{ color: loyalty.tierColor }}>{loyalty.tier} tier</span>
                  {loyalty.nextTier && (
                    <span className="text-gray-500"> · {loyalty.pointsToNextTier} pts to {loyalty.nextTier}</span>
                  )}
                </p>
              </div>
              {loyalty.nextTier && (
                <div className="text-right flex-shrink-0">
                  <Trophy className="w-5 h-5 mb-1" style={{ color: loyalty.tierColor }} />
                  <p className="text-[10px] text-gray-500">{loyalty.progressPercent}%</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold text-sm rounded-sm hover:bg-primary hover:text-white transition-all"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Browse More Files
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/orders">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold text-sm hover:border-primary/40 hover:text-primary transition-colors rounded-sm bg-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Download className="w-4 h-4" />
                Order History
              </button>
            </Link>
            <Link href="/">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold text-sm hover:border-primary/40 hover:text-primary transition-colors rounded-sm bg-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
