/**
 * Upload all generated product PDFs to the Print Static store via the tRPC API.
 * Runs as an admin user using a session cookie obtained from the dev server.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = "/home/ubuntu/product_pdfs";
const BASE_URL = "http://localhost:3000";

// Map product PDF filenames to product IDs in the store
const PRODUCT_MAP = {
  "weekly-planner.pdf": "weekly-planner",
  "budget-planner.pdf": "budget-planner",
  "habit-tracker.pdf": "habit-tracker",
  "goal-workbook.pdf": "goal-workbook",
  "meal-planner.pdf": "meal-planner",
  "journal-bundle.pdf": "journal-bundle",
  "resume-bundle.pdf": "resume-bundle",
  "social-calendar.pdf": "social-calendar",
  "social-templates.pdf": "social-templates",
  "notion-template.pdf": "notion-template",
  "brand-kit.pdf": "brand-kit",
  "business-card.pdf": "business-card",
  "wall-art-geometric.pdf": "wall-art-geometric",
  "wall-art-quotes.pdf": "wall-art-quotes",
  "wedding-invite.pdf": "wedding-invite",
  "party-invite.pdf": "party-invite",
  "kids-activity.pdf": "kids-activity",
};

async function getAdminCookie() {
  // Try to get a session by calling the auth endpoint
  // We'll use the owner's credentials via the OAuth flow
  // For now, check if there's a session cookie in the browser
  console.log("Checking server health...");
  const res = await fetch(`${BASE_URL}/api/trpc/auth.me`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  console.log("Server status:", res.status);
  return null;
}

async function uploadPDF(sessionCookie, productId, filePath) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const fileData = fileBuffer.toString("base64");
  const fileSize = fileBuffer.length;

  const body = JSON.stringify({
    "0": {
      json: {
        productId,
        fileName,
        fileData,
        mimeType: "application/pdf",
        fileSize,
      },
    },
  });

  const res = await fetch(`${BASE_URL}/api/trpc/files.uploadFile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    body,
  });

  const data = await res.json();
  return data;
}

async function main() {
  console.log("=== Print Static PDF Upload Script ===\n");

  // First check server is running
  try {
    const health = await fetch(`${BASE_URL}/api/trpc/auth.me`);
    console.log(`Server is running (status: ${health.status})\n`);
  } catch (e) {
    console.error("Server not reachable:", e.message);
    process.exit(1);
  }

  const files = Object.entries(PRODUCT_MAP);
  console.log(`Found ${files.length} products to upload\n`);

  // We need admin session - output instructions
  console.log("NOTE: This script requires an admin session cookie.");
  console.log("To get the cookie:");
  console.log("1. Log in to the store at http://localhost:3000");
  console.log("2. Open DevTools → Application → Cookies");
  console.log("3. Copy the 'session' cookie value");
  console.log("4. Set it as SESSION_COOKIE env var\n");

  const sessionCookie = process.env.SESSION_COOKIE
    ? `session=${process.env.SESSION_COOKIE}`
    : null;

  if (!sessionCookie) {
    console.log(
      "No SESSION_COOKIE provided. Attempting upload without auth (will fail for protected routes)...\n"
    );
  }

  let successCount = 0;
  let failCount = 0;

  for (const [filename, productId] of files) {
    const filePath = path.join(PDF_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ SKIP: ${filename} not found`);
      failCount++;
      continue;
    }

    process.stdout.write(`Uploading ${filename} → ${productId}... `);
    try {
      const result = await uploadPDF(sessionCookie, productId, filePath);
      if (result?.[0]?.result?.data?.json?.success) {
        console.log(`✓ OK`);
        successCount++;
      } else {
        console.log(`✗ FAILED: ${JSON.stringify(result).slice(0, 100)}`);
        failCount++;
      }
    } catch (e) {
      console.log(`✗ ERROR: ${e.message}`);
      failCount++;
    }
  }

  console.log(`\n=== Done: ${successCount} uploaded, ${failCount} failed ===`);
}

main().catch(console.error);
