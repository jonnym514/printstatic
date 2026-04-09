/* ============================================================
   Print Static — Order History Page
   Shows all past purchases with real S3 download links.
   ============================================================ */

import { useMemo } from "react";
import { Link } from "wouter";
import { Download, ShoppingBag, ArrowLeft, FileText, Clock, CheckCircle, Loader2, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { getProductById } from "@/lib/products";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function Orders() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { data: orders, isLoading, error } = trpc.stripe.getOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Collect all unique product IDs across all orders
  const allProductIds = useMemo(() => {
    if (!orders) return [];
    const ids = new Set<string>();
    for (const order of orders) {
      const pids = order.productIds as string[];
      pids.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [orders]);

  // Fetch download links for all purchased products at once
  const { data: downloadLinks, isLoading: linksLoading } = trpc.files.getDownloadLinks.useQuery(
    { productIds: allProductIds },
    {
      enabled: isAuthenticated && allProductIds.length > 0,
    }
  );

  // Build a lookup map: productId → array of download links
  const linksByProduct = useMemo(() => {
    const map: Record<string, typeof downloadLinks> = {};
    if (!downloadLinks) return map;
    for (const link of downloadLinks) {
      if (!map[link.productId]) map[link.productId] = [];
      map[link.productId]!.push(link);
    }
    return map;
  }, [downloadLinks]);

  // Not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-24 flex flex-col items-center justify-center text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-6" />
          <h1
            className="text-3xl font-bold text-foreground mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sign in to view your orders
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Your order history and download links are saved to your account. Sign in to access them.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-semibold text-sm hover:bg-primary hover:text-white transition-all"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sign In
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header */}
      <section className="ink-section py-12">
        <div className="container">
          <p
            className="mono-label mb-3 text-primary"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            /orders — download_history
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Your Downloads
          </h1>
          <p className="text-white/50 mt-3 text-sm">
            All your purchased files are available below. Re-download anytime.
          </p>
        </div>
      </section>

      <main className="flex-1 container py-12">
        {/* Back link */}
        <Link href="/shop">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </span>
        </Link>

        {/* Loading state */}
        {(authLoading || isLoading) && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-sm p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/3 mb-6" />
                <div className="h-10 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-destructive/30 bg-destructive/5 rounded-sm p-6 text-center">
            <p className="text-destructive text-sm">Failed to load orders. Please try again.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && orders && orders.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h2
              className="text-2xl font-bold text-foreground mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Your purchased files will appear here. Browse the shop to find your first download.
            </p>
            <Link href="/shop">
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-semibold text-sm hover:bg-primary hover:text-white transition-all cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Browse Files
              </span>
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && !error && orders && orders.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""} · {orders.reduce((sum, o) => sum + ((o.productIds as string[])?.length ?? 0), 0)} files total
            </p>

            {orders.map((order) => {
              const productIds = (order.productIds as string[]) ?? [];
              const catalogProducts = productIds.map((id) => getProductById(id)).filter(Boolean);

              return (
                <div
                  key={order.id}
                  className="border border-border rounded-sm overflow-hidden"
                >
                  {/* Order header */}
                  <div className="bg-muted/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <p
                          className="text-xs font-bold text-foreground"
                          style={{ fontFamily: "'Space Mono', monospace" }}
                        >
                          ORDER_{order.id.toString().padStart(6, "0")}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="text-xs px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        {order.status?.toUpperCase() ?? "COMPLETED"}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {formatAmount(order.amountTotal ?? 0, order.currency ?? "usd")}
                      </span>
                    </div>
                  </div>

                  {/* Products in order */}
                  <div className="divide-y divide-border">
                    {catalogProducts.length > 0 ? (
                      catalogProducts.map((product) => {
                        const productLinks = linksByProduct[product!.id] ?? [];
                        const isLoadingLinks = linksLoading && allProductIds.length > 0;

                        return (
                          <div
                            key={product!.id}
                            className="px-6 py-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-sm overflow-hidden bg-muted flex-shrink-0">
                                  <img
                                    src={product!.image}
                                    alt={product!.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p
                                    className="text-sm font-semibold text-foreground"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                  >
                                    {product!.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    <span
                                      className="text-primary"
                                      style={{ fontFamily: "'Space Mono', monospace" }}
                                    >
                                      .{product!.fileFormat ?? "PDF"}
                                    </span>
                                    {" · "}
                                    {product!.category}
                                  </p>
                                </div>
                              </div>

                              {/* Download buttons */}
                              <div className="flex flex-wrap gap-2 shrink-0">
                                {isLoadingLinks ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Loading…
                                  </span>
                                ) : productLinks.length > 0 ? (
                                  productLinks.map((link) => (
                                    <a
                                      key={link.fileId}
                                      href={link.downloadUrl}
                                      download={link.fileName}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-semibold hover:bg-primary hover:text-white transition-all flex-shrink-0 rounded-sm no-underline"
                                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                      title={link.fileName}
                                    >
                                      <Download className="w-3 h-3" />
                                      {productLinks.length > 1 ? link.fileName.split(".")[0].slice(0, 20) : "Download File"}
                                    </a>
                                  ))
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground border border-border rounded-sm">
                                    <Package className="w-3 h-3" />
                                    File coming soon
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Fallback if product IDs don't match catalog */
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {productIds.length} file{productIds.length !== 1 ? "s" : ""} purchased
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
