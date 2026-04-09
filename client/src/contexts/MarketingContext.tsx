/**
 * PixelPrintables — Marketing Agent Context
 * Philosophy: Scandinavian Minimalism / Clean Boutique
 * Manages: content queue, platform connections, approval workflow, analytics
 */

import React, { createContext, useContext, useState, useEffect } from "react";

export type Platform = "pinterest" | "instagram" | "tiktok" | "email";

export type PostStatus = "pending_approval" | "approved" | "scheduled" | "published" | "rejected";

export type ContentType = "pin" | "reel" | "story" | "email_campaign" | "tiktok_video";

export interface MarketingPost {
  id: string;
  platform: Platform;
  contentType: ContentType;
  title: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  productId?: string;
  productName?: string;
  scheduledFor: string; // ISO date string
  status: PostStatus;
  createdAt: string;
  approvedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
  estimatedReach?: number;
  isFirstBatch: boolean; // First 2 posts per platform require approval
}

export interface PlatformConnection {
  platform: Platform;
  connected: boolean;
  accountName?: string;
  accountUrl?: string;
  followers?: number;
  setupStep: "not_started" | "account_created" | "buffer_connected" | "ready";
  notes: string;
}

export interface MarketingStats {
  totalPostsPublished: number;
  totalPostsPending: number;
  totalReach: number;
  totalClicks: number;
  emailSubscribers: number;
  topPerformingPlatform: Platform | null;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  previewText: string;
  body: string;
  targetSegment: "all" | "new_subscribers" | "buyers";
  scheduledFor: string;
  status: PostStatus;
  isFirstBatch: boolean;
}

interface MarketingContextType {
  posts: MarketingPost[];
  emailCampaigns: EmailCampaign[];
  platformConnections: PlatformConnection[];
  stats: MarketingStats;
  approvePost: (id: string) => void;
  rejectPost: (id: string, reason: string) => void;
  approveEmail: (id: string) => void;
  rejectEmail: (id: string, reason: string) => void;
  updatePlatformConnection: (platform: Platform, updates: Partial<PlatformConnection>) => void;
  addPost: (post: Omit<MarketingPost, "id" | "createdAt">) => void;
  regeneratePost: (id: string) => void;
}

const MarketingContext = createContext<MarketingContextType | undefined>(undefined);

// ─── Seed Data: Pre-generated content queue ──────────────────────────────────

const INITIAL_POSTS: MarketingPost[] = [
  // Pinterest — first 2 require approval
  {
    id: "pin-001",
    platform: "pinterest",
    contentType: "pin",
    title: "Weekly Planner Printable — Botanical Edition",
    caption: "Stay organized in style ✨ Our Botanical Weekly Planner features delicate fern line art, time-blocked daily sections, and a priority task list. Instant PDF download — print at home on any printer. Perfect for planners, students & professionals.",
    hashtags: ["#weeklyplanner", "#printableplanner", "#botanicalplanner", "#planneraddicts", "#digitaldownload", "#printables", "#organizeyourlife", "#plannercommunity"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/product-planner-DmCYhprkmtTsf4Ey6395G7.webp",
    productId: "weekly-planner",
    productName: "Weekly Planner — Botanical Edition",
    scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    estimatedReach: 4200,
    isFirstBatch: true,
  },
  {
    id: "pin-002",
    platform: "pinterest",
    contentType: "pin",
    title: "Monthly Budget Planner PDF — Take Control of Your Finances",
    caption: "Stop wondering where your money went 💸 Our Monthly Budget Planner includes income tracking, expense categories, debt payoff worksheets & savings goals — all in one beautiful printable. Instant download. Print as many copies as you need.",
    hashtags: ["#budgetplanner", "#budgetprintable", "#financeplanner", "#savemoney", "#budgeting101", "#printableplanner", "#digitaldownload", "#moneytips"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/product-budget-j8PSJBBuJ3QhP8RzBSoD3e.webp",
    productId: "budget-planner",
    productName: "Monthly Budget Planner & Tracker",
    scheduledFor: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    estimatedReach: 5800,
    isFirstBatch: true,
  },
  {
    id: "pin-003",
    platform: "pinterest",
    contentType: "pin",
    title: "Minimalist Botanical Wall Art Printable Set",
    caption: "Transform any wall in minutes 🌿 This set of 3 minimalist botanical prints — fern, mountain & wildflower — comes in multiple sizes (4x6 to 11x14). Forest green & cream palette. Download, print, frame. No shipping wait.",
    hashtags: ["#wallartprintable", "#botanicalart", "#minimalistdecor", "#printableart", "#homedecorideas", "#digitaldownload", "#instantdownload", "#scandinaviandecor"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/product-wallart-WczApXkaYcxBTfNVWoCE7W.webp",
    productId: "botanical-wall-art",
    productName: "Botanical Wall Art Set — 3 Prints",
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "approved",
    createdAt: new Date().toISOString(),
    estimatedReach: 3900,
    isFirstBatch: false,
  },
  {
    id: "pin-004",
    platform: "pinterest",
    contentType: "pin",
    title: "ATS-Friendly Resume Template — Canva Editable",
    caption: "Land your dream job with a resume that actually gets noticed 📄 Our Professional Resume Bundle includes 5 ATS-friendly templates with matching cover letters. Editable in Canva (free), Word & Google Docs. Instant download.",
    hashtags: ["#resumetemplate", "#resumetips", "#jobsearch", "#careeradvice", "#canvatemplate", "#digitaldownload", "#resumedesign", "#jobhunting"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/product-templates-9GxNxiNdS6LUVRUVfc8P2C.webp",
    productId: "resume-template-bundle",
    productName: "Professional Resume Template Bundle",
    scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    createdAt: new Date().toISOString(),
    estimatedReach: 7100,
    isFirstBatch: false,
  },
  // Instagram Reels — first 2 require approval
  {
    id: "ig-001",
    platform: "instagram",
    contentType: "reel",
    title: "Unboxing a Botanical Planner (Print at Home!)",
    caption: "POV: Your planner finally matches your aesthetic 🌿✨\n\nOur Botanical Weekly Planner is an instant PDF download — print at home, no waiting, no shipping. Tap the link in bio to grab yours!\n\n#weeklyplanner #planneraddict #printable #digitaldownload #botanicalplanner #organizationgoals #stationerylove",
    hashtags: ["#weeklyplanner", "#planneraddict", "#printable", "#digitaldownload", "#botanicalplanner"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/product-planner-DmCYhprkmtTsf4Ey6395G7.webp",
    productId: "weekly-planner",
    productName: "Weekly Planner — Botanical Edition",
    scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    estimatedReach: 2800,
    isFirstBatch: true,
  },
  {
    id: "ig-002",
    platform: "instagram",
    contentType: "reel",
    title: "Budget Tracker That Actually Makes Saving Fun",
    caption: "The budget planner that changed how I think about money 💰\n\nInstant PDF download — includes monthly overview, weekly tracker, debt payoff sheet & savings goals. Link in bio!\n\n#budgetplanner #savemoney #financetips #printable #digitaldownload #moneymindset #budgeting",
    hashtags: ["#budgetplanner", "#savemoney", "#financetips", "#printable", "#digitaldownload"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/product-budget-j8PSJBBuJ3QhP8RzBSoD3e.webp",
    productId: "budget-planner",
    productName: "Monthly Budget Planner & Tracker",
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    estimatedReach: 3400,
    isFirstBatch: true,
  },
  // TikTok — first 2 require approval
  {
    id: "tt-001",
    platform: "tiktok",
    contentType: "tiktok_video",
    title: "How I Make Passive Income Selling Printables",
    caption: "I created this planner once and it sells every single day 📥 No inventory, no shipping, no stress. Just a PDF and a product page. Here's how it works… #digitalproducts #passiveincome #printables #sidehustle #digitaldownload #makemoneyonline",
    hashtags: ["#digitalproducts", "#passiveincome", "#printables", "#sidehustle", "#digitaldownload"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/hero-desk-nRZcHBAy7QaTL5qe2moYtM.webp",
    scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    estimatedReach: 8500,
    isFirstBatch: true,
  },
  {
    id: "tt-002",
    platform: "tiktok",
    contentType: "tiktok_video",
    title: "3 Printables That Sell Every Day on Autopilot",
    caption: "These 3 digital downloads generate sales while I sleep 😴💸 Planners, wall art, and resume templates — all instant PDF downloads. No shipping, no inventory. #digitalproducts #printables #passiveincome #sidehustle #etsy #digitaldownloads",
    hashtags: ["#digitalproducts", "#printables", "#passiveincome", "#sidehustle", "#etsy"],
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8/product-planner-DmCYhprkmtTsf4Ey6395G7.webp",
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    createdAt: new Date().toISOString(),
    estimatedReach: 12000,
    isFirstBatch: true,
  },
];

const INITIAL_EMAIL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: "email-001",
    subject: "Welcome to PixelPrintables 🌿 — Here's Your Free Planner Page",
    previewText: "Your free habit tracker is inside, plus a 10% welcome discount.",
    body: `Hi there,\n\nWelcome to PixelPrintables — we're so glad you're here.\n\nAs promised, here's your **free Minimalist Habit Tracker** (attached). Print it out, track your first 30 days, and let us know how it goes.\n\nWhile you're here, here are our most-loved products this week:\n\n• 🌿 Botanical Weekly Planner ($7.99)\n• 💰 Monthly Budget Planner ($6.99)\n• 📄 Resume Template Bundle ($9.99)\n\nAs a welcome gift, use code **WELCOME10** for 10% off your first order. Valid for 48 hours.\n\nShop now → pixelprintables.manus.space\n\nWith love,\nThe PixelPrintables Team`,
    targetSegment: "new_subscribers",
    scheduledFor: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    isFirstBatch: true,
  },
  {
    id: "email-002",
    subject: "New this week: Botanical Wall Art + 3 tips for a more organized home",
    previewText: "Three prints, instant download, under $6.",
    body: `Hi there,\n\nSpring is the perfect time to refresh your walls — and we've got just the thing.\n\nOur **Botanical Wall Art Set** (3 prints, $5.99) is now one of our most-loved products. Fern, mountain, wildflower — all in forest green and cream. Download, print, frame. Done.\n\n**3 quick tips for a more organized home:**\n1. Use a weekly planner to batch your tasks on Sunday night\n2. Keep a budget tracker on the fridge — visibility = accountability\n3. Declutter one drawer a week (15 minutes max)\n\nShop the full collection → pixelprintables.manus.space\n\nSee you next week,\nThe PixelPrintables Team`,
    targetSegment: "all",
    scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "pending_approval",
    isFirstBatch: true,
  },
];

const INITIAL_CONNECTIONS: PlatformConnection[] = [
  {
    platform: "pinterest",
    connected: false,
    setupStep: "not_started",
    notes: "Create a free Pinterest Business account, then connect it to Buffer to enable scheduled pinning.",
  },
  {
    platform: "instagram",
    connected: false,
    setupStep: "not_started",
    notes: "Create an Instagram Business account (free), link it to a Facebook Page, then connect to Buffer.",
  },
  {
    platform: "tiktok",
    connected: false,
    setupStep: "not_started",
    notes: "Create a TikTok account, switch to a Business account (free), then connect to Buffer.",
  },
  {
    platform: "email",
    connected: false,
    setupStep: "not_started",
    notes: "Sign up for a free Mailchimp or Kit (ConvertKit) account. Add the signup form to your homepage.",
  },
];

// ─── Provider ────────────────────────────────────────────────────────────────

export function MarketingProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<MarketingPost[]>(() => {
    const saved = localStorage.getItem("pp_marketing_posts");
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(() => {
    const saved = localStorage.getItem("pp_email_campaigns");
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_CAMPAIGNS;
  });

  const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>(() => {
    const saved = localStorage.getItem("pp_platform_connections");
    return saved ? JSON.parse(saved) : INITIAL_CONNECTIONS;
  });

  useEffect(() => {
    localStorage.setItem("pp_marketing_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("pp_email_campaigns", JSON.stringify(emailCampaigns));
  }, [emailCampaigns]);

  useEffect(() => {
    localStorage.setItem("pp_platform_connections", JSON.stringify(platformConnections));
  }, [platformConnections]);

  const stats: MarketingStats = {
    totalPostsPublished: posts.filter((p) => p.status === "published").length,
    totalPostsPending: posts.filter((p) => p.status === "pending_approval").length,
    totalReach: posts.filter((p) => p.status === "published").reduce((sum, p) => sum + (p.estimatedReach || 0), 0),
    totalClicks: Math.floor(posts.filter((p) => p.status === "published").reduce((sum, p) => sum + (p.estimatedReach || 0), 0) * 0.034),
    emailSubscribers: 0,
    topPerformingPlatform: "pinterest",
  };

  const approvePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "scheduled" as PostStatus, approvedAt: new Date().toISOString() } : p
      )
    );
  };

  const rejectPost = (id: string, reason: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "rejected" as PostStatus, rejectionReason: reason } : p
      )
    );
  };

  const approveEmail = (id: string) => {
    setEmailCampaigns((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "scheduled" as PostStatus, } : e
      )
    );
  };

  const rejectEmail = (id: string, reason: string) => {
    setEmailCampaigns((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "rejected" as PostStatus, rejectionReason: reason } : e
      )
    );
  };

  const updatePlatformConnection = (platform: Platform, updates: Partial<PlatformConnection>) => {
    setPlatformConnections((prev) =>
      prev.map((c) => (c.platform === platform ? { ...c, ...updates } : c))
    );
  };

  const addPost = (post: Omit<MarketingPost, "id" | "createdAt">) => {
    const newPost: MarketingPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const regeneratePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "pending_approval" as PostStatus,
              caption: p.caption + " [Regenerated]",
              rejectionReason: undefined,
            }
          : p
      )
    );
  };

  return (
    <MarketingContext.Provider
      value={{
        posts,
        emailCampaigns,
        platformConnections,
        stats,
        approvePost,
        rejectPost,
        approveEmail,
        rejectEmail,
        updatePlatformConnection,
        addPost,
        regeneratePost,
      }}
    >
      {children}
    </MarketingContext.Provider>
  );
}

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error("useMarketing must be used inside MarketingProvider");
  return ctx;
}
