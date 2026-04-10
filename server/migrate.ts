import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * Ensures all required database tables exist.
 * Runs on server startup â safe to call repeatedly (uses IF NOT EXISTS).
 */
export async function runMigrations(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Migrate] No database connection â skipping migrations");
    return;
  }

  console.log("[Migrate] Checking database tables...");

  const statements = [
    // ââ reviews ââââââââââââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId VARCHAR(128) NOT NULL,
        userId INT NOT NULL,
        userName VARCHAR(255),
        rating TINYINT NOT NULL,
        title VARCHAR(255),
        body TEXT,
        verified BOOLEAN NOT NULL DEFAULT false,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),

    // ââ flash_sales ââââââââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS flash_sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        productIds JSON NOT NULL,
        discountPercent INT NOT NULL,
        startsAt TIMESTAMP NOT NULL,
        endsAt TIMESTAMP NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),

    // ââ email_queue ââââââââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS email_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        toEmail VARCHAR(320) NOT NULL,
        toName VARCHAR(255),
        emailType ENUM('purchase_confirm','tips_followup','upsell','newsletter','abandoned_cart','weekly_digest') NOT NULL,
        subject VARCHAR(512) NOT NULL,
        htmlBody TEXT NOT NULL,
        orderId INT,
        sendAt TIMESTAMP NOT NULL,
        sent BOOLEAN NOT NULL DEFAULT false,
        sentAt TIMESTAMP NULL,
        error TEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),

    // ââ wishlist âââââââââââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        productId VARCHAR(128) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_wishlist (userId, productId)
      )
    `),

    // ââ loyalty_ledger âââââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS loyalty_ledger (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        points INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        orderId INT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),

    // ââ agent_logs âââââââââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS agent_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agentType VARCHAR(64) NOT NULL,
        action VARCHAR(128) NOT NULL,
        detail TEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),

    // ââ blog_posts âââââââââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        body LONGTEXT NOT NULL,
        author VARCHAR(128),
        tags JSON,
        published BOOLEAN NOT NULL DEFAULT false,
        publishedAt TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),

    // ââ email_subscribers ââââââââââââââââââââââââââââââââââââââââ
    sql.raw(`
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        name VARCHAR(255),
        source VARCHAR(64),
        subscribedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unsubscribedAt TIMESTAMP NULL
      )
    `),
  ];

  let created = 0;
  for (const stmt of statements) {
    try {
      await db.execute(stmt);
      created++;
    } catch (err: any) {
      console.error("[Migrate] Table creation error:", err.message);
    }
  }

  console.log(`[Migrate] Done â processed ${created}/${statements.length} tables`);
}

