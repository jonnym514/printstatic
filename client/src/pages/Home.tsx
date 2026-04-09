/* ============================================================
   Print Static — Home Page
   White studio aesthetic. Ink black accents. Cyan highlights.
   ============================================================ */

import { Link } from "wouter";
import { useState } from "react";
import { ArrowRight, Download, Zap, Shield, Cpu, Mail, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function EmailSubscribeSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const subscribe = trpc.agent.subscribeEmail.useMutation({
    onSuccess: () => { setSubscribed(true); setEmail(""); toast.success("You're on the list!"); },
    onError: (err: { message: string }) => toast.error(err.message),
  });
  return (
    <section className="container py-16">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-mono text-muted-foreground mb-3">/free_weekly_download</p>
        <h2
          className="text-4xl font-bold text-foreground mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
        >
          Get a Free Printable Every Week
        </h2>
        <p className="text-muted-foreground mb-8">
          Join 2,000+ subscribers who get a free printable download every Friday — plus early access to new products and exclusive discounts.
        </p>
        {subscribed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
              <Check className="w-5 h-5" />
              You're subscribed! Check your inbox every Friday.
            </div>
            {(subscribe as any).data?.sampleUrl && (
              <a
                href={(subscribe as any).data.sampleUrl}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-sm hover:opacity-90 transition-all"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Download className="w-4 h-4" />
                Download Your Free Sample
              </a>
            )}
          </div>
        ) : (
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && subscribe.mutate({ email, source: "homepage" })}
              className="flex-1 border border-border rounded-sm px-4 py-2.5 text-sm bg-background"
            />
            <button
              onClick={() => { if (email) subscribe.mutate({ email, source: "homepage" }); }}
              disabled={subscribe.isPending || !email}
              className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-bold rounded-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Mail className="w-4 h-4" />
              {subscribe.isPending ? "..." : "Subscribe"}
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/ps-w-hero-SEVHcTkVbhTpw54JxDkSdh.png";

const features = [
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    label: "01",
    title: "Instant Delivery",
    desc: "Files hit your inbox the second payment clears. Zero wait time. Zero shipping.",
  },
  {
    icon: <Download className="w-5 h-5 text-primary" />,
    label: "02",
    title: "Print Unlimited",
    desc: "One purchase, infinite prints. Use any home printer or send to a print shop.",
  },
  {
    icon: <Shield className="w-5 h-5 text-primary" />,
    label: "03",
    title: "Encrypted Checkout",
    desc: "Stripe-powered payments. Your data stays locked — always.",
  },
  {
    icon: <Cpu className="w-5 h-5 text-primary" />,
    label: "04",
    title: "Pixel-Perfect Files",
    desc: "Every file exports at 300 DPI. Crisp at any size, on any medium.",
  },
];

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="container py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div className="order-2 md:order-1">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em" }}
            >
              Design.
              <br />
              <span className="text-primary">Download.</span>
              <br />
              Print.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Premium digital templates, planners, and wall art — engineered for modern life. Rendered instantly. No shipping. No waiting. Just files that work.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <button
                  className="group inline-flex items-center gap-3 px-7 py-3.5 text-sm font-bold tracking-wide rounded-sm transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] active:scale-[0.98]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="flex -space-x-2">
                  {["oklch(0.55 0.18 195)", "oklch(0.35 0.14 195)", "oklch(0.20 0.10 195)"].map((c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-background"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    12,000+ downloads
                  </p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Space Mono', monospace" }}>
                    avg_rating: 4.9★
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="order-1 md:order-2 relative mt-4 md:mt-0">
            {/* Decorative dot grid — top right */}
            <div
              className="absolute -top-6 -right-6 w-40 h-40 opacity-25 z-0"
              style={{
                backgroundImage: "radial-gradient(circle, oklch(0.55 0.18 195) 1.5px, transparent 1.5px)",
                backgroundSize: "10px 10px",
              }}
            />
            {/* Decorative dot grid — bottom left */}
            <div
              className="absolute -bottom-6 -left-6 w-32 h-32 opacity-15 z-0"
              style={{
                backgroundImage: "radial-gradient(circle, oklch(0.35 0.14 195) 1.5px, transparent 1.5px)",
                backgroundSize: "10px 10px",
              }}
            />
            {/* Cyan accent line — left edge */}
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-primary rounded-full z-10" />
            {/* Main image frame */}
            <div className="relative rounded-sm overflow-hidden border border-border shadow-2xl ml-4 z-10" style={{ aspectRatio: '4/3' }}>
              <img
                src={HERO_IMG}
                alt="Print Static digital downloads — planner and templates"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Floating file badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-border rounded-sm px-4 py-3 shadow-lg">
                <p
                  className="mono-label mb-0.5 text-primary"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px' }}
                >
                  top_file.pdf
                </p>
                <p
                  className="text-sm font-bold text-foreground"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Weekly Planner Bundle
                </p>
                <p className="text-xs text-muted-foreground">1,284 downloads this week</p>
              </div>
              {/* Floating download count badge — top right */}
              <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-sm shadow-lg" style={{ fontFamily: "'Space Mono', monospace" }}>
                ↓ INSTANT
              </div>
            </div>
            {/* Floating product card — bottom right overlap */}
            <div className="absolute -bottom-5 -right-4 bg-white border border-border rounded-sm px-4 py-3 shadow-xl z-20 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>17 Products</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Space Mono', monospace" }}>ready_to_print</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Strip — ink black band ── */}
      <section className="ink-section py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 border border-white/10 rounded-sm bg-white/5">
                    {f.icon}
                  </div>
                  <span
                    className="text-xs text-white/40"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    [{f.label}]
                  </span>
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-white mb-1"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p
              className="mono-label mb-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              /featured_files
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
            >
              Top Downloads
            </h2>
          </div>
          <Link href="/shop">
            <span
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-70 transition-opacity"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} animationDelay={i * 100} />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link href="/shop">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 border border-foreground text-foreground font-semibold text-sm hover:bg-foreground hover:text-background transition-colors rounded-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              View All Files
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-muted border-y border-border py-20">
        <div className="container">
          <div className="text-center mb-14">
            <p
              className="mono-label mb-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              /process
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-foreground"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
            >
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: "01", title: "Select Your File", desc: "Browse the catalog. Filter by category. Find exactly what you need." },
              { step: "02", title: "Checkout Securely", desc: "Stripe handles the transaction. Encrypted end-to-end. Done in seconds." },
              { step: "03", title: "Download & Print", desc: "Your file is ready instantly. Print once or a hundred times — your license, your call." },
            ].map((item) => (
              <div key={item.step} className="relative border border-border rounded-sm p-6 bg-white shadow-sm">
                <div
                  className="text-5xl font-bold mb-4 text-primary/20 select-none"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {item.step}
                </div>
                <h3
                  className="text-lg font-bold text-foreground mb-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/60" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <p
            className="mono-label mb-3"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            /user_reviews
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            From the Community
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: "Sarah M.",
              handle: "@sarahm_creates",
              review: "The weekly planner totally changed how I start my mornings. Clean design, instant download — exactly what I needed.",
              product: "Weekly Planner",
            },
            {
              name: "Jessica T.",
              handle: "@jtdesigns",
              review: "Downloaded the resume template bundle and had an interview callback within days. The file quality is insane for the price.",
              product: "Resume Template Bundle",
            },
            {
              name: "Amanda K.",
              handle: "@amandak_home",
              review: "Printed the wall art at 18x24 and it looks like something from a gallery. Under $6. I've sent the link to everyone I know.",
              product: "Digital Wall Art",
            },
          ].map((t, i) => (
            <div key={i} className="border border-border rounded-sm p-6 bg-white shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {t.name}
                  </p>
                  <p className="text-xs text-primary" style={{ fontFamily: "'Space Mono', monospace" }}>
                    {t.handle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-sm bg-muted">
                  ★ 5.0
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.review}"</p>
              <div className="section-divider mb-3" />
              <p className="text-xs text-primary/70" style={{ fontFamily: "'Space Mono', monospace" }}>
                file: {t.product}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bundle CTA ── */}
      <section className="bg-muted border-y border-border py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-3">/bundle_deals</p>
              <h2
                className="text-4xl font-bold text-foreground mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
              >
                Save up to 33%<br />with Bundles
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our curated bundles combine best-selling products at a fraction of the individual price. Perfect for planners, creators, and professionals who want it all.
              </p>
              <Link href="/bundles">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-foreground text-background rounded-sm hover:bg-primary hover:text-white transition-all"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  View All Bundles
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Planner Bundle", count: "4 files", saving: "Save $8" },
                { label: "Business Bundle", count: "3 files", saving: "Save $7" },
                { label: "Creative Bundle", count: "4 files", saving: "Save $10" },
                { label: "Ultimate Bundle", count: "8 files", saving: "Save $20" },
              ].map((b) => (
                <div key={b.label} className="border border-border rounded-sm p-4 bg-white shadow-sm">
                  <p className="text-sm font-bold text-foreground mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{b.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">{b.count}</p>
                  <p className="text-xs text-green-600 font-bold mt-2">{b.saving}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Email Subscribe ── */}
      <EmailSubscribeSection />

      {/* ── CTA Banner — ink black ── */}
      <section className="container pb-20">
        <div className="relative rounded-sm px-8 py-12 md:py-16 text-center overflow-hidden ink-section">
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(oklch(0.55 0.18 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.18 195) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10">
            <p
              className="mono-label mb-4 text-primary"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              ready_to_download?
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
            >
              Start creating today.
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
              Over 12,000 downloads served. Join the community of creators, planners, and makers who run on Print Static.
            </p>
            <Link href="/shop">
              <button
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold tracking-wide bg-primary text-white rounded-sm hover:opacity-90 active:scale-95 transition-all duration-150"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Browse All Files
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
