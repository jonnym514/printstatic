#!/usr/bin/env node
/**
 * Bulk upload placeholder PDFs to S3 and register them in the database.
 *
 * Usage:
 *   1. Generate PDFs first: python generate_pdfs.py
 *   2. Run with env vars from the server process:
 *      SERVER_PID=$(pgrep -f "tsx watch" | head -1)
 *      ENV_VARS=$(cat /proc/$SERVER_PID/environ | tr '\0' '\n' | grep -E 'DATABASE_URL|AWS|S3|BUILT_IN')
 *      eval "export $ENV_VARS"
 *      node upload_pdfs.mjs
 *
 * Requires: @aws-sdk/client-s3, mysql2, dotenv (already in project dependencies)
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const PDF_DIR = "/tmp/product_pdfs";

// Map product IDs to file names — update to match your catalog
const PRODUCTS = [
  { id: "weekly-planner", fileName: "weekly-planner.pdf" },
  // Add more products here...
];

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  // Parse S3 credentials from BUILT_IN_FORGE_API_URL pattern
  // The storage helper uses these env vars — check server/storage.ts for exact names
  const s3 = new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  });

  const bucket = process.env.S3_BUCKET;
  const conn = await mysql.createConnection(dbUrl + "?ssl={'rejectUnauthorized':true}");

  console.log(`Uploading ${PRODUCTS.length} PDFs...`);

  for (const product of PRODUCTS) {
    const filePath = path.join(PDF_DIR, product.fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ Skipping ${product.id} — file not found: ${filePath}`);
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const fileKey = `product-files/${product.id}-${Date.now()}.pdf`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );

    const fileUrl = `${process.env.S3_PUBLIC_URL ?? `https://${bucket}.s3.amazonaws.com`}/${fileKey}`;

    await conn.execute(
      `INSERT INTO product_files (product_id, file_name, file_key, file_url, file_size, mime_type, uploaded_at)
       VALUES (?, ?, ?, ?, ?, 'application/pdf', ?)
       ON DUPLICATE KEY UPDATE file_key=VALUES(file_key), file_url=VALUES(file_url), uploaded_at=VALUES(uploaded_at)`,
      [product.id, product.fileName, fileKey, fileUrl, buffer.length, Date.now()]
    );

    console.log(`  ✓ ${product.id}`);
  }

  await conn.end();
  console.log("\nDone.");
}

main().catch(console.error);
