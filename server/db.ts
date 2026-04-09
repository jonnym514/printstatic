import { eq, desc, and, gte, lte, sql, avg, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, InsertOrder, InsertProductFile,
  InsertReview, InsertWishlistItem, InsertLoyaltyLedgerEntry,
  InsertFlashSale, InsertAgentLog, InsertBlogPost, InsertEmailSubscriber,
  users, orders, productFiles, reviews, wishlist, loyaltyLedger,
  flashSales, agentLogs, blogPosts, emailSubscribers,
} from "../drizzle/schema";
import { ENV } from './env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ─────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ─── Order helpers ─────────────────────────────────────────────────────────────

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(order);
}

export async function getOrderBySessionId(stripeSessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.stripeSessionId, stripeSessionId)).limit(1);
  return result[0];
}

export async function getOrdersByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.customerEmail, email)).orderBy(desc(orders.createdAt));
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

// ─── Product file helpers ─────────────────────────────────────────────────────

export async function insertProductFile(file: InsertProductFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(productFiles).values(file);
}

export async function getFilesByProductId(productId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productFiles).where(eq(productFiles.productId, productId)).orderBy(desc(productFiles.createdAt));
}

export async function getAllProductFiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productFiles).orderBy(desc(productFiles.createdAt));
}

export async function deleteProductFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(productFiles).where(eq(productFiles.id, id));
}

// ─── Review helpers ───────────────────────────────────────────────────────────

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reviews).values(review);
}

export async function getReviewsByProductId(productId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
}

export async function getReviewStats(productId: string) {
  const db = await getDb();
  if (!db) return { average: 0, count: 0 };
  const result = await db
    .select({ average: avg(reviews.rating), count: count() })
    .from(reviews)
    .where(eq(reviews.productId, productId));
  return { average: Number(result[0]?.average ?? 0), count: Number(result[0]?.count ?? 0) };
}

export async function getUserReviewForProduct(userId: number, productId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId))).limit(1);
  return result[0];
}

export async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

// ─── Wishlist helpers ─────────────────────────────────────────────────────────

export async function addToWishlist(item: InsertWishlistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(wishlist).values(item).onDuplicateKeyUpdate({ set: { productId: item.productId } });
}

export async function removeFromWishlist(userId: number, productId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
}

export async function getWishlistByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wishlist).where(eq(wishlist.userId, userId)).orderBy(desc(wishlist.createdAt));
}

export async function isInWishlist(userId: number, productId: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId))).limit(1);
  return result.length > 0;
}

// ─── Loyalty helpers ──────────────────────────────────────────────────────────

export async function addLoyaltyPoints(entry: InsertLoyaltyLedgerEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(loyaltyLedger).values(entry);
  // Update user balance
  await db.update(users)
    .set({ loyaltyPoints: sql`${users.loyaltyPoints} + ${entry.points}` })
    .where(eq(users.id, entry.userId));
}

export async function getLoyaltyHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyLedger).where(eq(loyaltyLedger.userId, userId)).orderBy(desc(loyaltyLedger.createdAt));
}

// ─── Flash sale helpers ───────────────────────────────────────────────────────

export async function getActiveFlashSales() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(flashSales)
    .where(and(eq(flashSales.active, true), lte(flashSales.startsAt, now), gte(flashSales.endsAt, now)));
}

export async function getAllFlashSales() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(flashSales).orderBy(desc(flashSales.createdAt));
}

export async function createFlashSale(sale: InsertFlashSale) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(flashSales).values(sale);
}

export async function deleteFlashSale(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(flashSales).where(eq(flashSales.id, id));
}

// ─── Agent log helpers ────────────────────────────────────────────────────────

export async function logAgentAction(log: InsertAgentLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(agentLogs).values(log);
}

export async function getAgentLogs(agentType?: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(agentLogs).orderBy(desc(agentLogs.createdAt)).limit(limit);
  if (agentType) return db.select().from(agentLogs)
    .where(eq(agentLogs.agentType, agentType)).orderBy(desc(agentLogs.createdAt)).limit(limit);
  return q;
}

// ─── Blog post helpers ────────────────────────────────────────────────────────

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(blogPosts).values(post);
}

export async function getBlogPosts(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) {
    return db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.publishedAt));
  }
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0];
}

export async function publishBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set({ published: true, publishedAt: new Date() }).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// ─── Email subscriber helpers ─────────────────────────────────────────────────

export async function addEmailSubscriber(sub: InsertEmailSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emailSubscribers).values(sub).onDuplicateKeyUpdate({ set: { active: true } });
}

export async function getEmailSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSubscribers).where(eq(emailSubscribers.active, true)).orderBy(desc(emailSubscribers.createdAt));
}

export async function getSubscriberCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(emailSubscribers).where(eq(emailSubscribers.active, true));
  return Number(result[0]?.count ?? 0);
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

export async function getStoreStats() {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalSubscribers: 0 };
  const [revenueResult, ordersResult, customersResult, subscribersResult] = await Promise.all([
    db.select({ total: sql<number>`SUM(amountTotal)` }).from(orders).where(eq(orders.status, "completed")),
    db.select({ count: count() }).from(orders).where(eq(orders.status, "completed")),
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(emailSubscribers).where(eq(emailSubscribers.active, true)),
  ]);
  return {
    totalRevenue: Number(revenueResult[0]?.total ?? 0),
    totalOrders: Number(ordersResult[0]?.count ?? 0),
    totalCustomers: Number(customersResult[0]?.count ?? 0),
    totalSubscribers: Number(subscribersResult[0]?.count ?? 0),
  };
}

// ─── Email queue helpers ──────────────────────────────────────────────────────

import {
  emailQueue, scheduledPosts,
  InsertEmailQueueItem, InsertScheduledPost,
} from "../drizzle/schema";

export async function enqueueEmail(item: InsertEmailQueueItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(emailQueue).values(item);
}

export async function getPendingEmails() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(emailQueue)
    .where(and(eq(emailQueue.sent, false), lte(emailQueue.sendAt, now)))
    .orderBy(emailQueue.sendAt)
    .limit(50);
}

export async function markEmailSent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(emailQueue).set({ sent: true, sentAt: new Date() }).where(eq(emailQueue.id, id));
}

export async function markEmailFailed(id: number, error: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(emailQueue).set({ error }).where(eq(emailQueue.id, id));
}

export async function getEmailQueueStats() {
  const db = await getDb();
  if (!db) return { pending: 0, sent: 0, failed: 0 };
  const [pending, sent, failed] = await Promise.all([
    db.select({ count: count() }).from(emailQueue).where(eq(emailQueue.sent, false)),
    db.select({ count: count() }).from(emailQueue).where(eq(emailQueue.sent, true)),
    db.select({ count: count() }).from(emailQueue).where(sql`error IS NOT NULL`),
  ]);
  return {
    pending: Number(pending[0]?.count ?? 0),
    sent: Number(sent[0]?.count ?? 0),
    failed: Number(failed[0]?.count ?? 0),
  };
}

// ─── Scheduled posts helpers ──────────────────────────────────────────────────

export async function createScheduledPost(post: InsertScheduledPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(scheduledPosts).values(post);
}

export async function getScheduledPosts(status?: "draft" | "approved" | "posted" | "skipped") {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(scheduledPosts)
      .where(eq(scheduledPosts.status, status))
      .orderBy(desc(scheduledPosts.createdAt));
  }
  return db.select().from(scheduledPosts).orderBy(desc(scheduledPosts.createdAt));
}

export async function updateScheduledPostStatus(id: number, status: "draft" | "approved" | "posted" | "skipped") {
  const db = await getDb();
  if (!db) return;
  await db.update(scheduledPosts).set({ status }).where(eq(scheduledPosts.id, id));
}

export async function deleteScheduledPost(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(scheduledPosts).where(eq(scheduledPosts.id, id));
}
