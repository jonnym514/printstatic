/**
 * Seed script: Upload all product PDFs to S3 and register them in the database.
 * Run with: npx tsx seed-product-files.ts
 */
import fs from "fs";
import path from "path";
import "dotenv/config";
import { storagePut } from "./server/storage";
import { getDb } from "./server/db";
import { productFiles } from "./drizzle/schema";

const PDF_DIR = "/home/ubuntu/product_pdfs";

const PRODUCT_MAP: Record<string, string> = {
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

  let successCount = 0;
  let failCount = 0;

  for (const [productId, filename] of Object.entries(PRODUCT_MAP)) {
    const filePath = path.join(PDF_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ SKIP: ${filename} not found`);
      failCount++;
      continue;
    }

    process.stdout.write(`Uploading ${filename} → "${productId}"... `);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;
      const timestamp = Date.now();
      const s3Key = `product-files/${productId}/${timestamp}-${filename}`;

      // Upload bytes to S3
      await storagePut(s3Key, fileBuffer, "application/pdf");

      // Register in database
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(productFiles).values({
        productId,
        fileName: filename,
        s3Key,
        mimeType: "application/pdf",
        fileSize,
        uploadedBy: undefined,
      });

      console.log(`✓  (${(fileSize / 1024).toFixed(1)} KB)`);
      successCount++;
    } catch (e: any) {
      console.log(`✗  ${e.message}`);
      failCount++;
    }
  }

  console.log(`\n=== Done: ${successCount} uploaded, ${failCount} failed ===`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
