/**
 * PixelPrintables — Marketing Agent Dashboard
 * Philosophy: Scandinavian Minimalism / Clean Boutique
 * The command center for the automated marketing agent.
 * Shows: platform setup, content queue, approval workflow, analytics overview
 */

import { useState } from "react";
import { Link } from "wouter";
import { useMarketing, Platform, MarketingPost, EmailCampaign } from "@/contexts/MarketingContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  RefreshCw,
  ArrowLeft,
  Zap,
  Mail,
  BarChart3,
  Link2,
  AlertCircle,
  ChevronRight,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Instagram,
  Globe,
} from "lucide-react";

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const PLATFORM_LABELS: Record<Platform, string> = {
  pinterest: "Pinterest",
  instagram: "Instagram",
  tiktok: "TikTok",
  email: "Email",
};

const PLATFORM_ICONS: Record<Platform, React.ElementType> = {
  pinterest: PinterestIcon,
  instagram: Instagram,
  tiktok: TikTokIcon,
  email: Mail,
};
function statusBadge(status: string) {
  switch (status) {
    case "pending_approval":
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    case "approved":
      return <Badge variant="outline" className="text-blue-600 border-blue-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
    case "scheduled":
      return <Badge variant="outline" className="text-cyan-600 border-cyan-600"><Calendar className="w-3 h-3 mr-1" /> Scheduled</Badge>;
    case "published":
      return <Badge variant="outline" className="text-green-600 border-green-600"><Send className="w-3 h-3 mr-1" /> Published</Badge>;
    case "rejected":
      return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PostCard({
  post,
  onApprove,
  onReject,
  onRegenerate,
}: {
  post: MarketingPost;
  onApprove: () => void;
  onReject: () => void;
  onRegenerate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const PlatformIcon = PLATFORM_ICONS[post.platform];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <PlatformIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase">
              {PLATFORM_LABELS[post.platform]} \u00b7 {post.contentType}
            </span>
          </div>
          {statusBadge(post.status)}
        </div>
        <CardTitle className="text-base mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover rounded-sm" />
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expanded ? post.caption : post.caption.slice(0, 140) + (post.caption.length > 140 ? "\u2026" : "")}
        </p>
        {post.caption.length > 140 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline">
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.scheduledFor)}</span>
          {post.estimatedReach && (
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> ~{post.estimatedReach.toLocaleString()} reach</span>
          )}
        </div>
        {post.rejectionReason && (
          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded-sm">
            <AlertCircle className="w-3 h-3 inline mr-1" />Rejected: {post.rejectionReason}
          </div>
        )}
        {post.status === "pending_approval" && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={onApprove} className="flex-1"><CheckCircle2 className="w-3 h-3 mr-1" /> Approve</Button>
            <Button size="sm" variant="outline" onClick={onReject} className="flex-1"><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
          </div>
        )}
        {post.status === "rejected" && (
          <Button size="sm" variant="outline" onClick={onRegenerate} className="w-full">
            <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
          </Button>
        )}
        {post.isFirstBatch && post.status === "pending_approval" && (
          <p className="text-xs text-yellow-600 dark:text-yellow-500">
            <AlertCircle className="w-3 h-3 inline mr-1" />First batch \u2014 requires your approval before posting
          </p>
        )}
      </CardContent>
    </Card>
  );
}
function EmailCard({
  campaign,
  onApprove,
  onReject,
}: {
  campaign: EmailCampaign;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase">
              Email \u00b7 {campaign.targetSegment.replace("_", " ")}
            </span>
          </div>
          {statusBadge(campaign.status)}
        </div>
        <CardTitle className="text-base mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {campaign.subject}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground italic">{campaign.previewText}</p>
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {expanded ? campaign.body : campaign.body.slice(0, 200) + "\u2026"}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline">
          {expanded ? "Show less" : "Read full email"}
        </button>
        <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-border">
          <Calendar className="w-3 h-3 mr-1" /> Scheduled: {formatDate(campaign.scheduledFor)}
        </div>
        {campaign.status === "pending_approval" && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={onApprove} className="flex-1"><CheckCircle2 className="w-3 h-3 mr-1" /> Approve</Button>
            <Button size="sm" variant="outline" onClick={onReject} className="flex-1"><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlatformSetupCard({
  platform,
  connection,
  onUpdate,
}: {
  platform: Platform;
  connection: { connected: boolean; setupStep: string; notes: string; accountName?: string };
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const PlatformIcon = PLATFORM_ICONS[platform];
  const steps = ["not_started", "account_created", "buffer_connected", "ready"];
  const stepIndex = steps.indexOf(connection.setupStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlatformIcon className="w-5 h-5" />
            <CardTitle className="text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {PLATFORM_LABELS[platform]}
            </CardTitle>
          </div>
          {connection.connected ? (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">Connected</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Not connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">Step {stepIndex + 1} of {steps.length}: {connection.setupStep.replace(/_/g, " ")}</p>
        <p className="text-sm text-muted-foreground">{connection.notes}</p>
        {connection.accountName && (
          <p className="text-xs text-foreground"><Link2 className="w-3 h-3 inline mr-1" />{connection.accountName}</p>
        )}
        {!connection.connected && (
          <Button size="sm" variant="outline" onClick={() => {
            const nextStep = steps[Math.min(stepIndex + 1, steps.length - 1)];
            const isReady = nextStep === "ready";
            onUpdate({ setupStep: nextStep, connected: isReady });
            toast.success(isReady ? `${PLATFORM_LABELS[platform]} is now connected!` : `${PLATFORM_LABELS[platform]} setup advanced to: ${nextStep.replace(/_/g, " ")}`);
          }}>
            <ChevronRight className="w-3 h-3 mr-1" /> Advance Setup
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
export default function MarketingDashboard() {
  const {
    posts, emailCampaigns, platformConnections, stats,
    approvePost, rejectPost, approveEmail, rejectEmail,
    updatePlatformConnection, regeneratePost,
  } = useMarketing();

  const pendingPosts = posts.filter((p) => p.status === "pending_approval");
  const scheduledPosts = posts.filter((p) => p.status === "scheduled" || p.status === "approved");
  const rejectedPosts = posts.filter((p) => p.status === "rejected");
  const pendingEmails = emailCampaigns.filter((e) => e.status === "pending_approval");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="w-4 h-4" /> Back to store
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Marketing Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">AI-powered content queue, platform setup & analytics</p>
            </div>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              <Zap className="w-3 h-3 mr-1" />{pendingPosts.length + pendingEmails.length} pending approval
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border p-4">
            <div className="flex items-center gap-2 mb-1"><Send className="w-4 h-4 text-primary" /><span className="text-xs font-mono text-muted-foreground">Published</span></div>
            <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stats.totalPostsPublished}</div>
          </Card>
          <Card className="border-border p-4">
            <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-yellow-600" /><span className="text-xs font-mono text-muted-foreground">Pending</span></div>
            <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stats.totalPostsPending}</div>
          </Card>
          <Card className="border-border p-4">
            <div className="flex items-center gap-2 mb-1"><Eye className="w-4 h-4 text-cyan-600" /><span className="text-xs font-mono text-muted-foreground">Est. Reach</span></div>
            <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stats.totalReach.toLocaleString()}</div>
          </Card>
          <Card className="border-border p-4">
            <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-green-600" /><span className="text-xs font-mono text-muted-foreground">Subscribers</span></div>
            <div className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stats.emailSubscribers}</div>
          </Card>
        </div>

        <Tabs defaultValue="approval" className="space-y-6">
          <TabsList>
            <TabsTrigger value="approval">Approval Queue {pendingPosts.length + pendingEmails.length > 0 && `(${pendingPosts.length + pendingEmails.length})`}</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="platforms">Platform Setup</TabsTrigger>
            <TabsTrigger value="emails">Email Campaigns</TabsTrigger>
          </TabsList>
          <TabsContent value="approval" className="space-y-4">
            {pendingPosts.length === 0 && pendingEmails.length === 0 ? (
              <Card className="border-border p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">All caught up! No posts pending approval.</p>
              </Card>
            ) : (
              <>
                {pendingEmails.length > 0 && (
                  <>
                    <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Email Campaigns</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {pendingEmails.map((campaign) => (
                        <EmailCard key={campaign.id} campaign={campaign}
                          onApprove={() => { approveEmail(campaign.id); toast.success("Email campaign approved & scheduled"); }}
                          onReject={() => { rejectEmail(campaign.id, "Needs revision"); toast.info("Email campaign rejected"); }}
                        />
                      ))}
                    </div>
                    <Separator />
                  </>
                )}
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Social Posts</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingPosts.map((post) => (
                    <PostCard key={post.id} post={post}
                      onApprove={() => { approvePost(post.id); toast.success(`"${post.title}" approved & scheduled`); }}
                      onReject={() => { rejectPost(post.id, "Needs revision"); toast.info(`"${post.title}" rejected`); }}
                      onRegenerate={() => regeneratePost(post.id)}
                    />
                  ))}
                </div>
              </>
            )}
            {rejectedPosts.length > 0 && (
              <>
                <Separator />
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Rejected Posts</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedPosts.map((post) => (
                    <PostCard key={post.id} post={post}
                      onApprove={() => approvePost(post.id)}
                      onReject={() => rejectPost(post.id, "Needs revision")}
                      onRegenerate={() => { regeneratePost(post.id); toast.success(`"${post.title}" regenerated`); }}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledPosts.length === 0 ? (
              <Card className="border-border p-8 text-center">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No scheduled posts yet. Approve some from the queue!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledPosts.map((post) => (
                  <PostCard key={post.id} post={post} onApprove={() => {}} onReject={() => {}} onRegenerate={() => {}} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            <p className="text-sm text-muted-foreground">Connect your social accounts to enable automated posting.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {platformConnections.map((conn) => (
                <PlatformSetupCard key={conn.platform} platform={conn.platform} connection={conn}
                  onUpdate={(updates) => updatePlatformConnection(conn.platform, updates)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            {emailCampaigns.length === 0 ? (
              <Card className="border-border p-8 text-center">
                <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No email campaigns yet.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {emailCampaigns.map((campaign) => (
                  <EmailCard key={campaign.id} campaign={campaign}
                    onApprove={() => { approveEmail(campaign.id); toast.success("Email campaign approved & scheduled"); }}
                    onReject={() => { rejectEmail(campaign.id, "Needs revision"); toast.info("Email campaign rejected"); }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
