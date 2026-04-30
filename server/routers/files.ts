/**
 * Files Router — FIX for missing download-link endpoints
 *
 * This file replaces/extends the existing routers/files.ts to add:
 * 1. getDownloadLinksForSession — public endpoint for the OrderSuccess page
 * 2. getDownloadLinks — protected endpoint for Order History page
 *
 * Location on server: server/routers/files.ts
 */

import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { storagePut, storageGet } from "../storage";
import {
  insertProductFile,
  getFilesByProductId,
  getAllProductFiles,
  deleteProductFile,
  getOrderBySessionId,
  getOrdersByUserId,
  getOrdersByEmail,
} from "../db";
import { getProductById } from "../../shared/products";

export const filesRouter = router({

  /**
   * Admin: Upload a file for a product (base64 encoded).
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
      const buffer = Buffer.from(input.fileData, "base64");
      const timestamp = Date.now();
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const s3Key = `product-files/${input.productId}/${timestamp}-${safeName}`;

      await storagePut(s3Key, buffer, input.mimeType);

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
   * Admin: Get all files across all products.
   */
  getAllFiles: adminProcedure.query(async () => {
    return getAllProductFiles();
  }),

  /**
   * Admin: Delete a product file by ID.
   */
  deleteFile: adminProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteProductFile(input.fileId);
      return { success: true };
    }),

  // ─── PUBLIC: Download links for OrderSuccess page ─────────────────────────

  /**
   * Get download links for a completed checkout session.
   * Called by the OrderSuccess page after Stripe redirects back.
   * Public because the customer may not be logged in (guest checkout).
   * The session_id acts as a proof-of-purchase token.
   */
  getDownloadLinksForSession: publicProcedure
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(async ({ input }) => {
      // Look up the order by Stripe session ID
      const order = await getOrderBySessionId(input.sessionId);
      if (!order) {
        // Order not yet created by webhook — frontend will poll/retry
        return { ready: false, downloads: [] };
      }

      // Parse product IDs from the order
      let productIds: string[] = [];
      try {
        productIds = typeof order.productIds === "string"
          ? JSON.parse(order.productIds)
          : (order.productIds ?? []);
      } catch {
        productIds = [];
      }

      if (productIds.length === 0) {
        return { ready: true, downloads: [] };
      }

      // Generate signed download URLs for each product's files
      const downloads = await generateDownloadLinks(productIds);

      return { ready: true, downloads };
    }),

  // ─── PROTECTED: Download links for Order History page ─────────────────────

  /**
   * Get download links for all orders belonging to the logged-in user.
   * Used on the Order History / My Downloads page.
   */
  getDownloadLinks: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userEmail = ctx.user.email;

    // Get orders by user ID, fall back to email lookup
    let userOrders = await getOrdersByUserId(userId);
    if (userOrders.length === 0 && userEmail) {
      userOrders = await getOrdersByEmail(userEmail);
    }

    if (userOrders.length === 0) {
      return [];
    }

    // Build a response per order with download links
    const result = await Promise.all(
      userOrders.map(async (order) => {
        let productIds: string[] = [];
        try {
          productIds = typeof order.productIds === "string"
            ? JSON.parse(order.productIds)
            : (order.productIds ?? []);
        } catch {
          productIds = [];
        }

        const downloads = await generateDownloadLinks(productIds);

        return {
          orderId: order.id,
          stripeSessionId: order.stripeSessionId,
          createdAt: order.createdAt,
          amountTotal: order.amountTotal,
          currency: order.currency,
          status: order.status,
          downloads,
        };
      })
    );

    return result;
  }),
});

// ─── Helper: Generate signed download URLs for a list of product IDs ────────

interface DownloadLink {
  productId: string;
  productName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  downloadUrl: string;
}

async function generateDownloadLinks(productIds: string[]): Promise<DownloadLink[]> {
  const downloads: DownloadLink[] = [];

  for (const productId of productIds) {
    const product = getProductById(productId);
    const files = await getFilesByProductId(productId);

    for (const file of files) {
      try {
        const { url } = await storageGet(file.s3Key);
        downloads.push({
          productId,
          productName: product?.name ?? productId,
          fileName: file.fileName,
          mimeType: file.mimeType ?? "application/pdf",
          fileSize: file.fileSize ?? 0,
          downloadUrl: url,
        });
      } catch (err) {
        console.error(`[Files] Failed to generate download URL for ${file.s3Key}:`, err);
      }
    }
  }

  return downloads;
}

/**
 * Exported for use by the webhook handler to generate a download page URL.
 * Returns the first download URL for a list of product IDs, or a fallback
 * to the order-success page.
 */
export async function getFirstDownloadUrl(
  productIds: string[],
  fallbackSessionId?: string
): Promise<string> {
  for (const productId of productIds) {
    const files = await getFilesByProductId(productId);
    if (files.length > 0) {
      try {
        const { url } = await storageGet(files[0].s3Key);
        return url;
      } catch {
        // continue to next
      }
    }
  }

  // Fallback: link to order success page where they can re-download
  if (fallbackSessionId) {
    return `https://printstatic.com/order-success?session_id=${fallbackSessionId}`;
  }
  return "https://printstatic.com/orders";
}
