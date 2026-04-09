/* ============================================================
   Referral Program Page — /referral
   Shows the user's unique referral link, stats, and how it works.
   ============================================================ */

import { useState } from "react";
import { Link } from "wouter";
import {
  Copy, Check, Share2, Users, Star, ArrowRight, Lock,
  Gift, TrendingUp, Loader2, ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Referral() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = trpc.referral.getMyCode.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: stats } = trpc.referral.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const referralUrl = referralData
    ? `${window.location.origin}/shop?ref=${referralData.code}`
    : "";

  const handleCopy = async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralUrl) return;
    if (navigator.share) {
      await navigator.share({
        title: "Print Static — Premium Printable Templates",
        text: "Check out Print Static for beautiful printable planners, wall art, and more. Use my link for instant downloads!",
        url: referralUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="ink-section py-12">
        <div className="container text-center">
          <p
            className="mono-label mb-3 text-primary"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            referral_program.exe
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Share & Earn
          </h1>
          <p className="text-white/50 text-base max-w-md mx-auto">
            Refer a friend and earn 100 loyalty points when they make their first purchase.
          </p>
        </div>
      </section>

      <div className="container py-16 flex-1">
        {/* Not logged in */}
        {!authLoading && !isAuthenticated && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Sign in to get your referral link
            </h2>
            <p className="text-muted-foreground mb-6">
              Log in to generate your unique referral link and start earning points.
            </p>
            <a href={getLoginUrl()}>
              <Button className="gap-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        )}

        {/* Loading */}
        {authLoading || (isAuthenticated && isLoading) ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : null}

        {/* Main content */}
        {!authLoading && !isLoading && isAuthenticated && referralData && (
          <div className="max-w-2xl mx-auto space-y-8">

            {/* Your Referral Link */}
            <div className="border border-primary/30 rounded-sm p-6 bg-primary/5">
              <p className="text-xs font-mono text-primary mb-2">// your_referral_link</p>
              <h2
                className="text-xl font-bold text-foreground mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Your Unique Link
              </h2>
              <div className="flex gap-2">
                <div className="flex-1 bg-background border border-border rounded-sm px-4 py-3 font-mono text-sm text-muted-foreground truncate">
                  {referralUrl}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="flex-shrink-0 border-primary/30 hover:bg-primary/10"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-primary" />}
                </Button>
                <Button
                  size="icon"
                  onClick={handleShare}
                  className="flex-shrink-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Share this link on social media, in emails, or with friends. You earn <strong className="text-primary">100 points</strong> every time someone uses it and makes a purchase.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Referrals", value: stats?.totalReferrals ?? 0, icon: <Users className="w-5 h-5 text-primary" /> },
                { label: "Converted", value: stats?.converted ?? 0, icon: <Check className="w-5 h-5 text-green-500" /> },
                { label: "Points Earned", value: stats?.totalPointsEarned ?? 0, icon: <Star className="w-5 h-5 text-yellow-500" /> },
              ].map((stat) => (
                <div key={stat.label} className="border border-border rounded-sm p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    {stat.icon}
                  </div>
                  <p
                    className="text-2xl font-bold text-foreground"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="border border-border rounded-sm p-6">
              <h2
                className="text-xl font-bold text-foreground mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                How It Works
              </h2>
              <div className="space-y-5">
                {[
                  {
                    step: "01",
                    title: "Share your link",
                    desc: "Copy your unique referral link above and share it anywhere — social media, email, messages, or your blog.",
                    icon: <Share2 className="w-5 h-5 text-primary" />,
                  },
                  {
                    step: "02",
                    title: "Friend visits & buys",
                    desc: "When someone clicks your link and makes their first purchase on Print Static, the referral is automatically tracked.",
                    icon: <ExternalLink className="w-5 h-5 text-primary" />,
                  },
                  {
                    step: "03",
                    title: "You earn 100 points",
                    desc: "100 loyalty points are instantly added to your account. Redeem them for discounts on future purchases.",
                    icon: <Gift className="w-5 h-5 text-primary" />,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-primary">{item.step}</span>
                        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {item.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral history */}
            {stats && stats.referrals.length > 0 && (
              <div>
                <h2
                  className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Referral History
                </h2>
                <div className="border border-border rounded-sm divide-y divide-border">
                  {stats.referrals.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground font-mono">{r.code}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {r.converted ? (
                          <>
                            <span className="inline-block text-[10px] font-bold text-green-600 bg-green-600/10 px-2 py-0.5 rounded-full font-mono">
                              CONVERTED
                            </span>
                            <p className="text-xs text-primary mt-0.5">+{r.pointsAwarded} pts</p>
                          </>
                        ) : (
                          <span className="inline-block text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Want to earn even more points?
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/rewards">
                  <Button variant="outline" className="gap-2">
                    <Star className="w-4 h-4" /> View Rewards
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button className="gap-2">
                    Browse Shop <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
