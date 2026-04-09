/**
 * Seed script: Upload all product PDFs to S3 and register them in the database.
 * Run with: node seed-product-files.mjs
 * 
 * This script runs server-side and bypasses auth — only run in development/setup.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = "/home/ubuntu/product_pdfs";

// Product ID → PDF filename mapping
const PRODUCT_MAP = {
  "weekly-planner": "weekly-planner.pdf",
  "budget-planner": "budget-planner.pdf",
  "habit-tracker": "habit-tracker.pdf",
  "goal-workbook": "goal-workbook.pdf",
  "meal-planner": "meal-planner.pdf",
  "journal-bundle": "journal-bundle.pdf",
  "resume-bundle": "resume-bundle.pdf",
  "social-calendar": "social-calendar.pdf",
  "social-templates": "social-templates.pdf",
  "notion-template": "notion-template.pdf",
  "brand-kit": "brand-kit.pdf",
  "business-card": "business-card.pdf",
  "wall-art-geometric": "wall-art-geometric.pdf",
  "wall-art-quotes": "wall-art-quotes.pdf",
  "wedding-invite": "wedding-invite.pdf",
  "party-invite": "party-invite.pdf",
  "kids-activity": "kids-activity.pdf",
};

async function main() {
  console.log("=== Print Static — Product File Seeder ===\n");

  // Dynamically import server modules (ESM)
  const { storagePut } = await import("./server/storage.js").catch(async () => {
    // Try compiled version
    return await import("./dist/storage.js");
  });

  const { db } = await import("./server/db.js").catch(async () => {
    return await import("./dist/db.js");
  });

  const { productFiles } = await import("./drizzle/schema.js").catch(async () => {
    return await import("./dist/schema.js");
  });

  let successCount = 0;
  let failCount = 0;

  for (const [productId, filename] of Object.entries(PRODUCT_MAP)) {
    const filePath = path.join(PDF_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ SKIP: ${filename} not found at ${filePath}`);
      failCount++;
      continue;
    }

    process.stdout.write(`Uploading ${filename} → product "${productId}"... `);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;
      const timestamp = Date.now();
      const s3Key = `product-files/${productId}/${timestamp}-${filename}`;

      // Upload to S3
      await storagePut(s3Key, fileBuffer, "application/pdf");

      // Insert record into database
      await db.insert(productFiles).values({
        productId,
        fileName: filename,
        s3Key,
        mimeType: "application/pdf",
        fileSize,
        uploadedBy: null, // seeded, no specific uploader
      });

      console.log(`✓ OK (${(fileSize / 1024).toFixed(1)} KB)`);
      successCount++;
    } catch (e) {
      console.log(`✗ ERROR: ${e.message}`);
      failCount++;
    }
  }

  console.log(`\n=== Done: ${successCount} uploaded, ${failCount} failed ===`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
