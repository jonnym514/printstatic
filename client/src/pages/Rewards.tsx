/* ============================================================
   Rewards Page — /rewards
   Shows loyalty points balance, tier progress, history,
   and redemption options for logged-in users.
   ============================================================ */

import { Link } from "wouter";
import {
  Star, Trophy, Zap, Gift, ArrowRight, Lock, CheckCircle2,
  TrendingUp, Clock, ShoppingBag, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";

const TIERS = [
  {
    name: "Bronze",
    min: 0,
    max: 499,
    color: "#cd7f32",
    bg: "#cd7f3215",
    perks: ["1 point per $1 spent", "Early access to new products", "Birthday bonus points"],
  },
  {
    name: "Silver",
    min: 500,
    max: 1499,
    color: "#c0c0c0",
    bg: "#c0c0c015",
    perks: ["1.25× points multiplier", "Exclusive Silver discounts", "Priority support"],
  },
  {
    name: "Gold",
    min: 1500,
    max: 2999,
    color: "#ffd700",
    bg: "#ffd70015",
    perks: ["1.5× points multiplier", "Free product every 2,000 pts", "VIP new releases"],
  },
  {
    name: "Platinum",
    min: 3000,
    max: Infinity,
    color: "#e5e4e2",
    bg: "#e5e4e215",
    perks: ["2× points multiplier", "Monthly free download", "Dedicated support line"],
  },
];

const REDEMPTIONS = [
  { pts: 100, value: "$1.00 off", icon: <Gift className="w-5 h-5" />, available: true },
  { pts: 500, value: "$5.00 off", icon: <Gift className="w-5 h-5" />, available: true },
  { pts: 1000, value: "$10.00 off", icon: <Gift className="w-5 h-5" />, available: true },
  { pts: 2000, value: "Free product (up to $15)", icon: <ShoppingBag className="w-5 h-5" />, available: false },
];

export default function Rewards() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const { data: loyalty, isLoading: loyaltyLoading } = trpc.loyalty.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: history, isLoading: historyLoading } = trpc.loyalty.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const currentTier = TIERS.find((t) => loyalty && loyalty.points >= t.min && loyalty.points <= t.max) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1] ?? null;

  const isLoading = authLoading || loyaltyLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="ink-section py-12">
        <div className="container text-center">
          <p
            className="mono-label mb-3 text-primary"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            loyalty_program.exe
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}
          >
            Earn. Redeem. Repeat.
          </h1>
          <p className="text-white/50 text-base max-w-md mx-auto">
            Every dollar you spend earns points. Redeem them for discounts and free products.
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
              Sign in to view your rewards
            </h2>
            <p className="text-muted-foreground mb-6">
              Log in to see your points balance, tier status, and redemption options.
            </p>
            <a href={getLoginUrl()}>
              <Button className="gap-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        )}

        {/* Loading */}
        {isLoading && isAuthenticated && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Main content — logged in */}
        {!isLoading && isAuthenticated && loyalty && (
          <div className="max-w-3xl mx-auto space-y-8">

            {/* Points Balance Card */}
            <div
              className="rounded-sm p-8 flex flex-col md:flex-row items-center gap-6"
              style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: currentTier.color + "22", border: `3px solid ${currentTier.color}55` }}
              >
                <Star className="w-10 h-10" style={{ color: currentTier.color }} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs text-gray-400 font-mono mb-1">// current_balance</p>
                <p
                  className="text-5xl font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {loyalty.points.toLocaleString()}
                  <span className="text-2xl text-gray-400 ml-2">pts</span>
                </p>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ background: currentTier.color + "22", color: currentTier.color, fontFamily: "'Space Mono', monospace" }}
                  >
                    {currentTier.name} Tier
                  </span>
                  {nextTier && (
                    <span className="text-xs text-gray-400">
                      {loyalty.pointsToNextTier} pts to {nextTier.name}
                    </span>
                  )}
                </div>
              </div>
              {nextTier && (
                <div className="text-center flex-shrink-0">
                  <div className="w-16 h-16 relative">
                    <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#ffffff10" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke={currentTier.color}
                        strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - loyalty.progressPercent / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{loyalty.progressPercent}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">to {nextTier.name}</p>
                </div>
              )}
            </div>

            {/* Tier Progression */}
            <div>
              <h2
                className="text-xl font-bold text-foreground mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Tier Benefits
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIERS.map((tier) => {
                  const isActive = tier.name === currentTier.name;
                  const isUnlocked = loyalty.points >= tier.min;
                  return (
                    <div
                      key={tier.name}
                      className={`rounded-sm p-5 border transition-all ${isActive ? "border-primary/40" : "border-border"}`}
                      style={{ background: isActive ? tier.bg : undefined }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: tier.color + "22", border: `1px solid ${tier.color}44` }}
                        >
                          <Trophy className="w-4 h-4" style={{ color: tier.color }} />
                        </div>
                        <div>
                          <p
                            className="font-bold text-foreground text-sm"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", color: isActive ? tier.color : undefined }}
                          >
                            {tier.name}
                            {isActive && (
                              <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-mono">
                                CURRENT
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tier.max === Infinity ? `${tier.min.toLocaleString()}+ pts` : `${tier.min.toLocaleString()}–${tier.max.toLocaleString()} pts`}
                          </p>
                        </div>
                        {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground ml-auto" />}
                        {isUnlocked && !isActive && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                      </div>
                      <ul className="space-y-1">
                        {tier.perks.map((perk) => (
                          <li key={perk} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span
                              className="w-1 h-1 rounded-full flex-shrink-0"
                              style={{ background: isUnlocked ? tier.color : "#666" }}
                            />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Redemption Options */}
            <div>
              <h2
                className="text-xl font-bold text-foreground mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Redeem Points
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {REDEMPTIONS.map((r) => {
                  const canRedeem = loyalty.points >= r.pts;
                  return (
                    <div
                      key={r.pts}
                      className={`rounded-sm p-4 border text-center transition-all ${canRedeem ? "border-primary/30 bg-primary/5 hover:border-primary/60 cursor-pointer" : "border-border opacity-50"}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${canRedeem ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {r.icon}
                      </div>
                      <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {r.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.pts.toLocaleString()} pts</p>
                      {canRedeem ? (
                        <span className="mt-2 inline-block text-[10px] font-bold text-primary font-mono">AVAILABLE</span>
                      ) : (
                        <span className="mt-2 inline-block text-[10px] text-muted-foreground font-mono">
                          Need {(r.pts - loyalty.points).toLocaleString()} more
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                To redeem points, enter your points balance as a promo code at checkout or{" "}
                <a href="mailto:support@printstatic.com" className="text-primary underline">contact support</a>.
                Full redemption portal coming soon.
              </p>
            </div>

            {/* How to Earn */}
            <div className="border border-border rounded-sm p-6">
              <h2
                className="text-xl font-bold text-foreground mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                How to Earn Points
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <ShoppingBag className="w-5 h-5 text-primary" />, label: "Make a purchase", desc: "1 point per $1 spent (multiplied by tier)" },
                  { icon: <Star className="w-5 h-5 text-primary" />, label: "Leave a review", desc: "25 points per verified product review" },
                  { icon: <Zap className="w-5 h-5 text-primary" />, label: "Refer a friend", desc: "100 points when your referral makes their first purchase" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Points History */}
            <div>
              <h2
                className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Clock className="w-5 h-5 text-primary" />
                Points History
              </h2>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !history || history.length === 0 ? (
                <div className="border border-border rounded-sm p-8 text-center">
                  <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">No points yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make your first purchase to start earning points.
                  </p>
                  <Link href="/shop">
                    <Button size="sm" className="mt-4 gap-2">
                      Browse Shop <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="border border-border rounded-sm divide-y divide-border">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {entry.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${entry.points > 0 ? "text-green-600" : "text-red-500"}`}
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        {entry.points > 0 ? "+" : ""}{entry.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
