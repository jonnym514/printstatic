/**
 * One-time script: Upload all product PDFs to S3 and register them in the database.
 * Run with: node scripts/upload-pdfs.mjs
 *
 * Reads BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY, and DATABASE_URL from the environment.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = path.join("/home/ubuntu/product_pdfs");

// ── Storage helpers (mirrors server/storage.ts) ────────────────────────────

function getStorageConfig() {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("Missing BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY");
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function storagePut(relKey, buffer, contentType = "application/pdf") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = relKey.replace(/^\/+/, "");
  const uploadUrl = new URL(`v1/storage/upload`, baseUrl + "/");
  uploadUrl.searchParams.set("path", key);

  const blob = new Blob([buffer], { type: contentType });
  const form = new FormData();
  form.append("file", blob, key.split("/").pop() ?? key);

  const response = await fetch(uploadUrl.toString(), {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Upload failed (${response.status}): ${msg}`);
  }

  const json = await response.json();
  return { key, url: json.url };
}

// ── Database helper (direct MySQL via mysql2) ─────────────────────────────

async function insertProductFile(db, { productId, fileName, s3Key, mimeType, fileSize }) {
  await db.execute(
    `INSERT INTO product_files (productId, fileName, s3Key, mimeType, fileSize, createdAt)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [productId, fileName, s3Key, mimeType, fileSize]
  );
}

async function getExistingProductIds(db) {
  const [rows] = await db.execute(`SELECT DISTINCT productId FROM product_files`);
  return new Set(rows.map((r) => r.productId));
}

// ── Product list ──────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: "weekly-planner", name: "Weekly Planner Bundle" },
  { id: "budget-planner", name: "Budget Planner Spreadsheet" },
  { id: "habit-tracker", name: "Habit Tracker — 30 Day" },
  { id: "goal-workbook", name: "Goal Setting Workbook" },
  { id: "meal-planner", name: "Meal Planner + Grocery List" },
  { id: "journal-bundle", name: "Daily Journal + Gratitude Bundle" },
  { id: "resume-bundle", name: "Resume Template Bundle" },
  { id: "social-calendar", name: "Social Media Content Calendar" },
  { id: "social-templates", name: "Instagram Post Templates" },
  { id: "notion-template", name: "Notion Productivity Dashboard" },
  { id: "brand-kit", name: "Brand Identity Kit" },
  { id: "business-card", name: "Business Card Template Pack" },
  { id: "wall-art-geometric", name: "Geometric Wall Art Set" },
  { id: "wall-art-quotes", name: "Typography Quote Prints" },
  { id: "wedding-invite", name: "Wedding Invitation Suite" },
  { id: "party-invite", name: "Birthday Party Invitation Set" },
  { id: "kids-activity", name: "Kids Activity Sheets Pack" },
];

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  // Dynamically import mysql2 (available in the project)
  const mysql = await import("mysql2/promise");
  // Parse DATABASE_URL and handle SSL profile
  const dbUrl = new URL(process.env.DATABASE_URL);
  const sslParam = dbUrl.searchParams.get("ssl");
  const db = await mysql.createConnection({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || "3306"),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace(/^\//, ""),
    ssl: sslParam ? { rejectUnauthorized: false } : undefined,
  });

  console.log("Connected to database.");

  const existing = await getExistingProductIds(db);
  console.log(`Already uploaded: ${existing.size} products`);

  let uploaded = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    if (existing.has(product.id)) {
      console.log(`  ⏭  Skipping ${product.id} (already uploaded)`);
      skipped++;
      continue;
    }

    const pdfPath = path.join(PDF_DIR, `${product.id}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      console.log(`  ⚠  Missing PDF for ${product.id}, skipping`);
      continue;
    }

    const buffer = fs.readFileSync(pdfPath);
    const fileName = `${product.name}.pdf`;
    const s3Key = `product-files/${product.id}/${Date.now()}-${product.id}.pdf`;

    process.stdout.write(`  ↑  Uploading ${product.id}.pdf ... `);
    try {
      await storagePut(s3Key, buffer, "application/pdf");
      await insertProductFile(db, {
        productId: product.id,
        fileName,
        s3Key,
        mimeType: "application/pdf",
        fileSize: buffer.length,
      });
      console.log("✓");
      uploaded++;
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`);
    }
  }

  await db.end();

  console.log(`\nDone! Uploaded: ${uploaded}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
