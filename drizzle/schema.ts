import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Loyalty points balance */
  loyaltyPoints: int("loyaltyPoints").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table — one row per completed Stripe Checkout Session.
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  userId: int("userId"),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 255 }),
  productIds: json("productIds").notNull(),
  amountTotal: int("amountTotal").notNull(),
  currency: varchar("currency", { length: 10 }).default("usd").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "refunded"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Product files table — stores the S3 file info for each product's downloadable PDF.
 */
export const productFiles = mysqlTable("product_files", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 128 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).default("application/pdf").notNull(),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductFile = typeof productFiles.$inferSelect;
export type InsertProductFile = typeof productFiles.$inferInsert;

/**
 * Product reviews — verified buyer ratings and text reviews.
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 128 }).notNull(),
  userId: int("userId").notNull(),
  userName: varchar("userName", { length: 255 }),
  /** Star rating 1–5 */
  rating: tinyint("rating").notNull(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  /** Only verified purchasers can leave reviews */
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Wishlist — saved products per user.
 */
export const wishlist = mysqlTable("wishlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: varchar("productId", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlist.$inferSelect;
export type InsertWishlistItem = typeof wishlist.$inferInsert;

/**
 * Loyalty points ledger — tracks point earn/spend events.
 */
export const loyaltyLedger = mysqlTable("loyalty_ledger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Positive = earned, negative = spent */
  points: int("points").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  /** Reference to order if points were earned from a purchase */
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoyaltyLedgerEntry = typeof loyaltyLedger.$inferSelect;
export type InsertLoyaltyLedgerEntry = typeof loyaltyLedger.$inferInsert;

/**
 * Flash sales — time-limited discount events.
 */
export const flashSales = mysqlTable("flash_sales", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  /** JSON array of product IDs on sale, or ["ALL"] for site-wide */
  productIds: json("productIds").notNull(),
  /** Discount percentage 0–100 */
  discountPercent: int("discountPercent").notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlashSale = typeof flashSales.$inferSelect;
export type InsertFlashSale = typeof flashSales.$inferInsert;

/**
 * Agent logs — records of autonomous agent actions (marketing posts generated,
 * emails sent, SEO articles written, performance reports, etc.)
 */
export const agentLogs = mysqlTable("agent_logs", {
  id: int("id").autoincrement().primaryKey(),
  /** Agent type: marketing | seo | pricing | performance */
  agentType: varchar("agentType", { length: 64 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  /** JSON payload — content generated, metrics recorded, etc. */
  payload: json("payload"),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("success").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentLog = typeof agentLogs.$inferSelect;
export type InsertAgentLog = typeof agentLogs.$inferInsert;

/**
 * SEO blog posts — AI-generated keyword-targeted articles.
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  /** Target keyword for SEO */
  keyword: varchar("keyword", { length: 255 }),
  /** Estimated monthly search volume */
  searchVolume: int("searchVolume"),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Email subscribers — free download opt-ins and newsletter signups.
 */
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  /** Which lead magnet they signed up for */
  source: varchar("source", { length: 128 }).default("newsletter"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;

/**
 * Abandoned carts — logged when a logged-in user has items in their cart
 * but has not checked out. Used to trigger recovery emails after 24 hours.
 */
export const abandonedCarts = mysqlTable("abandoned_carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  userName: varchar("userName", { length: 255 }),
  /** JSON snapshot of cart items at time of abandonment */
  cartSnapshot: json("cartSnapshot").notNull(),
  /** Total cart value in dollars */
  cartTotal: float("cartTotal").notNull(),
  /** Whether a recovery email has been sent */
  emailSent: boolean("emailSent").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  /** Whether the user eventually completed checkout */
  recovered: boolean("recovered").default(false).notNull(),
  recoveredAt: timestamp("recoveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type InsertAbandonedCart = typeof abandonedCarts.$inferInsert;

/**
 * Referrals — tracks referral links and rewards.
 * Each user gets a unique referral code. When a referred user makes
 * their first purchase, the referrer earns 100 loyalty points.
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  /** The user who owns this referral code */
  referrerId: int("referrerId").notNull(),
  /** Unique 8-char alphanumeric code */
  code: varchar("code", { length: 16 }).notNull().unique(),
  /** User ID of the referred person (set when they sign up) */
  referredUserId: int("referredUserId"),
  /** Whether the referred user has made a qualifying purchase */
  converted: boolean("converted").default(false).notNull(),
  convertedAt: timestamp("convertedAt"),
  /** Points awarded to referrer on conversion */
  pointsAwarded: int("pointsAwarded").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Post-purchase email sequence queue — tracks which emails need to be sent
 * after a purchase (confirmation, tips, upsell).
 */
export const emailQueue = mysqlTable("email_queue", {
  id: int("id").autoincrement().primaryKey(),
  /** Customer email address */
  toEmail: varchar("toEmail", { length: 320 }).notNull(),
  toName: varchar("toName", { length: 255 }),
  /** Email type: purchase_confirm | tips_followup | upsell */
  emailType: mysqlEnum("emailType", ["purchase_confirm", "tips_followup", "upsell", "newsletter", "abandoned_cart", "weekly_digest"]).notNull(),
  subject: varchar("subject", { length: 512 }).notNull(),
  htmlBody: text("htmlBody").notNull(),
  /** Order ID this email relates to (if applicable) */
  orderId: int("orderId"),
  /** When to send — allows delayed sends */
  sendAt: timestamp("sendAt").notNull(),
  sent: boolean("sent").default(false).notNull(),
  sentAt: timestamp("sentAt"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailQueueItem = typeof emailQueue.$inferSelect;
export type InsertEmailQueueItem = typeof emailQueue.$inferInsert;

/**
 * Scheduled social media posts — AI-generated content queued for manual publishing.
 */
export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** Platform: instagram | pinterest | twitter | facebook */
  platform: mysqlEnum("platform", ["instagram", "pinterest", "twitter", "facebook"]).notNull(),
  caption: text("caption").notNull(),
  hashtags: text("hashtags"),
  /** CDN URL of the image to post */
  imageUrl: varchar("imageUrl", { length: 1024 }),
  /** Product this post is about */
  productId: varchar("productId", { length: 128 }),
  scheduledFor: timestamp("scheduledFor"),
  status: mysqlEnum("status", ["draft", "approved", "posted", "skipped"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

/**
 * Pinterest OAuth tokens — stores the access token for the connected Pinterest account.
 */
export const pinterestTokens = mysqlTable("pinterest_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  tokenType: varchar("tokenType", { length: 64 }).default("bearer"),
  scope: text("scope"),
  expiresAt: timestamp("expiresAt"),
  pinterestUserId: varchar("pinterestUserId", { length: 128 }),
  pinterestUsername: varchar("pinterestUsername", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type PinterestToken = typeof pinterestTokens.$inferSelect;
export type InsertPinterestToken = typeof pinterestTokens.$inferInsert;

/**
 * Pinterest pin history — tracks every pin posted by the agent.
 */
export const pinterestPins = mysqlTable("pinterest_pins", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 128 }).notNull(),
  boardId: varchar("boardId", { length: 128 }).notNull(),
  boardName: varchar("boardName", { length: 256 }),
  pinId: varchar("pinId", { length: 128 }),
  title: varchar("title", { length: 256 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  link: varchar("link", { length: 1024 }),
  status: mysqlEnum("status", ["pending", "posted", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  postedAt: timestamp("postedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PinterestPin = typeof pinterestPins.$inferSelect;
export type InsertPinterestPin = typeof pinterestPins.$inferInsert;
