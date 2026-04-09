/* ============================================================
   Print Static — Autonomous Agent Dashboard
   AI-powered marketing, SEO, performance, and store management
   ============================================================ */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  Bot, Zap, TrendingUp, Mail, FileText, BarChart3,
  Play, CheckCircle, Clock, AlertCircle, RefreshCw,
  Instagram, Globe, Sparkles, Users, DollarSign, Star,
  Eye, Trash2, Send, ChevronDown, ChevronUp, Package,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PRODUCT_CATALOG } from "../../../shared/products";
import { ShoppingCart, MailWarning } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Platform = "pinterest" | "instagram" | "tiktok" | "email";

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="border border-border rounded-sm p-5 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

// ── Content Result Card ───────────────────────────────────────────────────────
function ContentCard({ title, content, onCopy }: { title: string; content: string; onCopy: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const preview = content.slice(0, 200);
  return (
    <div className="border border-border rounded-sm p-5 bg-card">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm text-foreground">{title}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCopy}>Copy</Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
        {expanded ? content : preview}{!expanded && content.length > 200 && "..."}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgentDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Marketing state
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const [marketingTopic, setMarketingTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState<{ platform: string; content: string } | null>(null);

  // Blog state
  const [blogKeyword, setBlogKeyword] = useState("");
  const [blogTitle, setBlogTitle] = useState("");

  // Email campaign state
  const [emailTheme, setEmailTheme] = useState("");

  // Flash sale state
  const [saleProductIds, setSaleProductIds] = useState<string[]>(["ALL"]);
  const [saleDiscount, setSaleDiscount] = useState(20);
  const [saleName, setSaleName] = useState("");
  const [saleDurationHours, setSaleDurationHours] = useState(24);

  // tRPC
  const { data: stats } = trpc.agent.getStoreStats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: logs, refetch: refetchLogs } = trpc.agent.getLogs.useQuery({ limit: 20 }, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: blogPosts, refetch: refetchBlogPosts } = trpc.agent.getBlogPosts.useQuery({ publishedOnly: false }, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: flashSales, refetch: refetchSales } = trpc.agent.getAllFlashSales.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const { data: subscribers } = trpc.agent.getSubscribers.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });

  const generateMarketing = trpc.agent.generateMarketing.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast.success(`${data.platform} content generated!`);
      refetchLogs();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateBlog = trpc.agent.generateBlogPost.useMutation({
    onSuccess: (data) => {
      toast.success(`Blog post "${data.title}" created!`);
      refetchBlogPosts();
      refetchLogs();
      setBlogKeyword("");
      setBlogTitle("");
    },
    onError: (err) => toast.error(err.message),
  });

  const generateReport = trpc.agent.generatePerformanceReport.useMutation({
    onSuccess: (data) => {
      toast.success("Performance report generated!");
      refetchLogs();
      // Show report in a toast with a preview
      toast.info(data.report.slice(0, 200) + "...", { duration: 8000 });
    },
    onError: (err) => toast.error(err.message),
  });

  const generateEmail = trpc.agent.generateEmailCampaign.useMutation({
    onSuccess: (data) => {
      toast.success(`Email campaign "${data.subject}" generated!`);
      refetchLogs();
    },
    onError: (err) => toast.error(err.message),
  });

  const publishPost = trpc.agent.publishBlogPost.useMutation({
    onSuccess: () => { toast.success("Blog post published!"); refetchBlogPosts(); },
    onError: (err) => toast.error(err.message),
  });

  const deletePost = trpc.agent.deleteBlogPost.useMutation({
    onSuccess: () => { toast.success("Blog post deleted"); refetchBlogPosts(); },
    onError: (err) => toast.error(err.message),
  });

  const createSale = trpc.agent.createFlashSale.useMutation({
    onSuccess: () => {
      toast.success("Flash sale created!");
      refetchSales();
      setSaleName("");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteSale = trpc.agent.deleteFlashSale.useMutation({
    onSuccess: () => { toast.success("Flash sale deleted"); refetchSales(); },
    onError: (err) => toast.error(err.message),
  });

  // Abandoned cart recovery
  const { data: abandonedCartStats, refetch: refetchAbandonedCarts } = trpc.abandonedCart.listAbandonedCarts.useQuery(
    { limit: 10, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );
  const processAbandonedCarts = trpc.abandonedCart.processAbandonedCarts.useMutation({
    onSuccess: (data) => {
      toast.success(`Processed ${data.processed} abandoned cart${data.processed !== 1 ? 's' : ''} — recovery emails sent!`);
      refetchAbandonedCarts();
      refetchLogs();
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container flex-1 flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container flex-1 flex flex-col items-center justify-center py-24 text-center">
          <Bot className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Agent Dashboard
          </h2>
          <p className="text-muted-foreground mb-6">Sign in as admin to access the autonomous agent.</p>
          <Button onClick={() => window.location.href = getLoginUrl()}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container flex-1 flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Only</h2>
          <p className="text-muted-foreground">This dashboard is only accessible to store admins.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const platformIcons: Record<Platform, React.ElementType> = {
    pinterest: Globe,
    instagram: Instagram,
    tiktok: Zap,
    email: Mail,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono text-muted-foreground mb-2">// autonomous_agent</p>
          <h1 className="text-5xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>
            Agent Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered marketing, SEO, and store management — all in one place.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => navigate("/agent/pinterest")}
            className="flex items-center gap-2 px-4 py-2 rounded-sm border border-[#E60023]/40 bg-[#E60023]/5 hover:bg-[#E60023]/10 text-[#E60023] text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
            Pinterest Agent
          </button>
        </div>

        {/* Store Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <StatCard icon={DollarSign} label="total_revenue" value={`$${(stats.totalRevenue / 100).toFixed(2)}`} color="text-green-500" />
            <StatCard icon={Package} label="total_orders" value={stats.totalOrders} />
            <StatCard icon={Users} label="customers" value={stats.totalCustomers} />
            <StatCard icon={Mail} label="subscribers" value={stats.totalSubscribers} sub="email list" />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Agent Controls */}
          <div className="xl:col-span-2 space-y-8">

            {/* Marketing Content Generator */}
            <div className="border border-border rounded-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Marketing Content Generator
                  </h2>
                  <p className="text-xs text-muted-foreground">AI writes platform-specific posts for your products</p>
                </div>
              </div>

              {/* Platform selector */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(["pinterest", "instagram", "tiktok", "email"] as Platform[]).map((p) => {
                  const Icon = platformIcons[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium border transition-colors ${
                        selectedPlatform === p
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <input
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                  placeholder="Topic or product to focus on (optional — leave blank for best-sellers)"
                  value={marketingTopic}
                  onChange={(e) => setMarketingTopic(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => generateMarketing.mutate({ platform: selectedPlatform, topic: marketingTopic || undefined })}
                  disabled={generateMarketing.isPending}
                >
                  {generateMarketing.isPending ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Generate {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Content</>
                  )}
                </Button>
              </div>

              {generatedContent && (
                <div className="mt-4">
                  <ContentCard
                    title={`${generatedContent.platform.charAt(0).toUpperCase() + generatedContent.platform.slice(1)} Content`}
                    content={generatedContent.content}
                    onCopy={() => { navigator.clipboard.writeText(generatedContent.content); toast.success("Copied to clipboard!"); }}
                  />
                </div>
              )}
            </div>

            {/* SEO Blog Generator */}
            <div className="border border-border rounded-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    SEO Blog Generator
                  </h2>
                  <p className="text-xs text-muted-foreground">AI writes keyword-targeted articles that drive organic traffic</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                  placeholder="Target keyword (e.g. 'best printable planners 2026')"
                  value={blogKeyword}
                  onChange={(e) => setBlogKeyword(e.target.value)}
                />
                <input
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                  placeholder="Suggested title (optional)"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    if (!blogKeyword.trim()) { toast.error("Enter a target keyword"); return; }
                    generateBlog.mutate({ keyword: blogKeyword, title: blogTitle || undefined });
                  }}
                  disabled={generateBlog.isPending}
                >
                  {generateBlog.isPending ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Writing article...</>
                  ) : (
                    <><FileText className="w-4 h-4 mr-2" /> Generate Blog Post</>
                  )}
                </Button>
              </div>

              {/* Blog posts list */}
              {blogPosts && blogPosts.length > 0 && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-mono text-muted-foreground mb-3">// generated_posts</p>
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 border border-border rounded-sm text-sm">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-medium text-foreground truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{post.keyword} · {new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                          {post.published ? "Live" : "Draft"}
                        </Badge>
                        {!post.published && (
                          <Button size="sm" variant="outline" onClick={() => publishPost.mutate({ id: post.id })} disabled={publishPost.isPending}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Publish
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deletePost.mutate({ id: post.id })} className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Email Campaign Generator */}
            <div className="border border-border rounded-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-sm bg-purple-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Email Campaign Generator
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    AI writes subject lines, preview text, and full email body
                    {subscribers && ` · ${subscribers.length} subscribers`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                  placeholder="Campaign theme (e.g. 'New Year planning sale', 'Resume season')"
                  value={emailTheme}
                  onChange={(e) => setEmailTheme(e.target.value)}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    if (!emailTheme.trim()) { toast.error("Enter a campaign theme"); return; }
                    generateEmail.mutate({ theme: emailTheme });
                  }}
                  disabled={generateEmail.isPending}
                >
                  {generateEmail.isPending ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Writing campaign...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Generate Email Campaign</>
                  )}
                </Button>
              </div>

              {generateEmail.data && (
                <div className="mt-4 space-y-3">
                  <div className="bg-muted rounded-sm p-4 text-sm space-y-2">
                    <div><span className="font-mono text-xs text-muted-foreground">subject:</span> <span className="font-semibold">{generateEmail.data.subject}</span></div>
                    <div><span className="font-mono text-xs text-muted-foreground">preview:</span> <span className="text-foreground/70">{generateEmail.data.preview}</span></div>
                    <div><span className="font-mono text-xs text-muted-foreground">cta:</span> <span className="text-primary font-medium">{generateEmail.data.cta}</span></div>
                  </div>
                  <ContentCard
                    title="Email Body"
                    content={generateEmail.data.body}
                    onCopy={() => {
                      const full = `Subject: ${generateEmail.data!.subject}\nPreview: ${generateEmail.data!.preview}\n\n${generateEmail.data!.body}\n\nCTA: ${generateEmail.data!.cta}`;
                      navigator.clipboard.writeText(full);
                      toast.success("Full email copied!");
                    }}
                  />
                </div>
              )}
            </div>

            {/* Flash Sale Manager */}
            <div className="border border-border rounded-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-sm bg-amber-500/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Flash Sale Manager
                  </h2>
                  <p className="text-xs text-muted-foreground">Create time-limited discounts with live countdown timers</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <input
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                  placeholder="Sale name (e.g. 'Weekend Flash Sale')"
                  value={saleName}
                  onChange={(e) => setSaleName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-muted-foreground mb-1 block">Discount %</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                      value={saleDiscount}
                      onChange={(e) => setSaleDiscount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-muted-foreground mb-1 block">Duration (hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={168}
                      className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-background"
                      value={saleDurationHours}
                      onChange={(e) => setSaleDurationHours(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">Products (select or leave ALL for site-wide)</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSaleProductIds(["ALL"])}
                      className={`px-3 py-1 text-xs rounded-sm border transition-colors ${saleProductIds.includes("ALL") ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-primary"}`}
                    >
                      ALL Products
                    </button>
                    {PRODUCT_CATALOG.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (saleProductIds.includes("ALL")) {
                            setSaleProductIds([p.id]);
                          } else if (saleProductIds.includes(p.id)) {
                            setSaleProductIds(saleProductIds.filter((x) => x !== p.id));
                          } else {
                            setSaleProductIds([...saleProductIds, p.id]);
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-sm border transition-colors ${!saleProductIds.includes("ALL") && saleProductIds.includes(p.id) ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-primary"}`}
                      >
                        {p.name.split(" ").slice(0, 2).join(" ")}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!saleName.trim()) { toast.error("Enter a sale name"); return; }
                    const now = new Date();
                    const endsAt = new Date(now.getTime() + saleDurationHours * 3600000);
                    createSale.mutate({
                      name: saleName,
                      productIds: saleProductIds,
                      discountPercent: saleDiscount,
                      startsAt: now,
                      endsAt,
                    });
                  }}
                  disabled={createSale.isPending}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Launch Flash Sale
                </Button>
              </div>

              {/* Active sales */}
              {flashSales && flashSales.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-muted-foreground">// active_sales</p>
                  {flashSales.map((sale) => {
                    const isActive = new Date(sale.endsAt) > new Date() && sale.active;
                    return (
                      <div key={sale.id} className="flex items-center justify-between p-3 border border-border rounded-sm text-sm">
                        <div>
                          <p className="font-medium text-foreground">{sale.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            -{sale.discountPercent}% · ends {new Date(sale.endsAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                            {isActive ? "Active" : "Expired"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteSale.mutate({ id: sale.id })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Abandoned Cart Recovery */}
            <div className="border border-border rounded-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-sm bg-orange-500/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Abandoned Cart Recovery
                  </h2>
                  <p className="text-xs text-muted-foreground">Send AI-generated recovery emails to customers who left items in their cart</p>
                </div>
              </div>

              {abandonedCartStats && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="border border-border rounded-sm p-3 text-center">
                    <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {abandonedCartStats.stats.total}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">total</div>
                  </div>
                  <div className="border border-border rounded-sm p-3 text-center">
                    <div className="text-2xl font-bold text-orange-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {abandonedCartStats.stats.pendingCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">pending</div>
                  </div>
                  <div className="border border-border rounded-sm p-3 text-center">
                    <div className="text-2xl font-bold text-green-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {abandonedCartStats.stats.recoveredCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">recovered</div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                variant="outline"
                onClick={() => processAbandonedCarts.mutate()}
                disabled={processAbandonedCarts.isPending}
              >
                {processAbandonedCarts.isPending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Sending recovery emails...</>
                ) : (
                  <><MailWarning className="w-4 h-4 mr-2" /> Process Abandoned Carts (24h+)</>  
                )}
              </Button>

              {abandonedCartStats && abandonedCartStats.carts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-mono text-muted-foreground">// recent_abandoned_carts</p>
                  {abandonedCartStats.carts.slice(0, 5).map((cart) => (
                    <div key={cart.id} className="flex items-center justify-between p-3 border border-border rounded-sm text-xs">
                      <div>
                        <p className="font-medium text-foreground">{cart.userEmail}</p>
                        <p className="text-muted-foreground font-mono">
                          ${(cart.cartTotal / 100).toFixed(2)} · {new Date(cart.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={cart.recovered ? "secondary" : cart.emailSent ? "outline" : "default"} className="text-xs">
                        {cart.recovered ? "Recovered" : cart.emailSent ? "Email Sent" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Report */}
            <div className="border border-border rounded-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-sm bg-green-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Performance Report
                  </h2>
                  <p className="text-xs text-muted-foreground">AI analyzes your store metrics and gives actionable recommendations</p>
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => generateReport.mutate()}
                disabled={generateReport.isPending}
              >
                {generateReport.isPending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing store...</>
                ) : (
                  <><TrendingUp className="w-4 h-4 mr-2" /> Generate Weekly Report</>
                )}
              </Button>

              {generateReport.data && (() => {
                const reportText = typeof generateReport.data.report === 'string'
                  ? generateReport.data.report
                  : JSON.stringify(generateReport.data.report);
                return (
                  <div className="mt-4">
                    <ContentCard
                      title="Performance Report"
                      content={reportText}
                      onCopy={() => { navigator.clipboard.writeText(reportText); toast.success("Report copied!"); }}
                    />
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right: Activity Log */}
          <div className="space-y-6">
            <div className="border border-border rounded-sm p-5 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Agent Activity Log
                </h3>
              </div>

              {logs && logs.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 text-xs">
                      <div className="flex-shrink-0 mt-0.5">
                        {log.status === "success" ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : log.status === "failed" ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">{log.action}</p>
                        <p className="text-muted-foreground font-mono">
                          {log.agentType} · {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No agent activity yet. Run a task above to get started.</p>
                </div>
              )}
            </div>

            {/* Email subscribers */}
            {subscribers && subscribers.length > 0 && (
              <div className="border border-border rounded-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-4 h-4 text-purple-500" />
                  <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Email List ({subscribers.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {subscribers.slice(0, 10).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground truncate">{sub.email}</span>
                      <span className="text-muted-foreground font-mono flex-shrink-0 ml-2">{sub.source}</span>
                    </div>
                  ))}
                  {subscribers.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center">+{subscribers.length - 10} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
