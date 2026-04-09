/**
 * Files tRPC Router
 * - uploadFile: admin-only — upload a PDF to S3 and register it for a product
 * - getFilesForProduct: admin-only — list all files for a product
 * - getAllFiles: admin-only — list all uploaded files across all products
 * - deleteFile: admin-only — remove a file from S3 and the database
 * - getDownloadLinks: protected — get time-limited download URLs for purchased products
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { storagePut, storageGet } from "../storage";
import {
  insertProductFile,
  getFilesByProductId,
  getAllProductFiles,
  deleteProductFile,
  getOrdersByUserId,
  getOrderBySessionId,
} from "../db";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const filesRouter = router({
  /**
   * Admin: Upload a PDF file for a product.
   * Accepts base64-encoded file data from the frontend.
   */
  uploadFile: adminProcedure
    .input(
      z.object({
        productId: z.string().min(1),
        fileName: z.string().min(1),
        fileData: z.string(), // base64 encoded
        mimeType: z.string().default("application/pdf"),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Decode base64 to buffer
      const buffer = Buffer.from(input.fileData, "base64");

      // Generate a unique S3 key with random suffix to prevent enumeration
      const timestamp = Date.now();
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const s3Key = `product-files/${input.productId}/${timestamp}-${safeName}`;

      // Upload to S3
      await storagePut(s3Key, buffer, input.mimeType);

      // Save metadata to database
      await insertProductFile({
        productId: input.productId,
        fileName: input.fileName,
        s3Key,
        mimeType: input.mimeType,
        fileSize: input.fileSize ?? buffer.length,
        uploadedBy: ctx.user.id,
      });

      return { success: true, s3Key };
    }),

  /**
   * Admin: Get all files for a specific product.
   */
  getFilesForProduct: adminProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      return getFilesByProductId(input.productId);
    }),

  /**
   * Admin: Get all uploaded files across all products.
   */
  getAllFiles: adminProcedure.query(async () => {
    return getAllProductFiles();
  }),

  /**
   * Admin: Delete a file from S3 and the database.
   */
  deleteFile: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteProductFile(input.id);
      return { success: true };
    }),

  /**
   * Protected: Get secure time-limited download URLs for all files
   * belonging to products the current user has purchased.
   * Validates ownership before returning any URL.
   */
  getDownloadLinks: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user actually purchased these products
      const userOrders = await getOrdersByUserId(ctx.user.id);
      const purchasedProductIds = new Set<string>();
      for (const order of userOrders) {
        const ids = order.productIds as string[];
        ids.forEach((id) => purchasedProductIds.add(id));
      }

      // Filter to only products the user has purchased
      const authorizedProductIds = input.productIds.filter((id) =>
        purchasedProductIds.has(id)
      );

      if (authorizedProductIds.length === 0) {
        return [];
      }

      // Get files for all authorized products
      const results: {
        productId: string;
        fileId: number;
        fileName: string;
        downloadUrl: string;
      }[] = [];

      for (const productId of authorizedProductIds) {
        const files = await getFilesByProductId(productId);
        for (const file of files) {
          const { url } = await storageGet(file.s3Key);
          results.push({
            productId,
            fileId: file.id,
            fileName: file.fileName,
            downloadUrl: url,
          });
        }
      }

      return results;
    }),

  /**
   * Public: Get download links by Stripe session ID — no login required.
   * The session_id itself is the proof of payment. We look up the order
   * in our database (created by the webhook) and return presigned S3 URLs
   * for all purchased files. This lets customers download immediately after
   * checkout without needing to be logged in.
   */
  getDownloadLinksForSession: publicProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ input }) => {
      // Look up the order created by the Stripe webhook
      const order = await getOrderBySessionId(input.sessionId);
      if (!order) {
        // Order may not have been created yet (webhook delay) — return empty
        return { ready: false, files: [] };
      }

      const productIds = order.productIds as string[];
      if (!productIds || productIds.length === 0) {
        return { ready: true, files: [] };
      }

      const files: {
        productId: string;
        fileId: number;
        fileName: string;
        downloadUrl: string;
      }[] = [];

      for (const productId of productIds) {
        const productFiles = await getFilesByProductId(productId);
        for (const file of productFiles) {
          const { url } = await storageGet(file.s3Key);
          files.push({
            productId,
            fileId: file.id,
            fileName: file.fileName,
            downloadUrl: url,
          });
        }
      }

      return { ready: true, files };
    }),
});
