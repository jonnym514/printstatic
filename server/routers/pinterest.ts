/**
 * Pinterest tRPC Router
 *
 * Procedures:
 * - getStatus: public — check if Pinterest is connected
 * - getAuthUrl: public — get Pinterest OAuth URL
 * - getBoards: protected — list Pinterest boards
 * - getPinStats: protected — get pin performance stats
 * - getPinHistory: protected — paginated pin history
 * - disconnect: protected — disconnect Pinterest account
 * - postProducts: protected — AI agent posts products to Pinterest
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface PinHistoryEntry {
  pinId: string;
  productId: string;
  productName: string;
  boardId: string;
  boardName: string;
  url?: string;
  postedAt: Date;
  impressions: number;
  clicks: number;
}

export interface PinResult {
  productId: string;
  productName: string;
  status: "posted" | "failed" | "skipped";
  pinId?: string;
  error?: string;
}

// ── Router ─────────────────────────────────────────────────────────────────────

export const pinterestRouter = router({
  getStatus: publicProcedure.query(async () => {
    return { connected: false, username: undefined };
  }),

  getAuthUrl: publicProcedure
    .input(z.object({ origin: z.string().url().optional() }))
    .query(async ({ input }) => {
      const redirectUri = input.origin
        ? `${input.origin}/agent/pinterest`
        : "http://localhost:3000/agent/pinterest";
      const clientId = process.env.PINTEREST_CLIENT_ID || "stub";
      const scope = "boards:read,pins:read,pins:write,user_accounts:read";
      const authUrl = `https://api.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
      return { url: authUrl };
    }),

  getBoards: protectedProcedure.query(async () => {
    return [] as PinterestBoard[];
  }),

  getPinStats: protectedProcedure.query(async () => {
    return {
      totalPins: 0, totalImpressions: 0, totalClicks: 0,
      totalSaves: 0, avgImpressions: 0, avgClickRate: 0,
    };
  }),

  getPinHistory: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ input }) => {
      return {
        items: [] as PinHistoryEntry[],
        total: 0, limit: input.limit, offset: input.offset,
      };
    }),

  disconnect: protectedProcedure.mutation(async () => {
    return { success: true, message: "Pinterest account disconnected" };
  }),

  postProducts: protectedProcedure
    .input(z.object({
      boardMappings: z.array(z.object({
        boardId: z.string(),
        boardName: z.string(),
        productIds: z.array(z.string()).min(1),
      })),
    }))
    .mutation(async ({ input }) => {
      const results: PinResult[] = [];
      for (const mapping of input.boardMappings) {
        for (const productId of mapping.productIds) {
          results.push({
            productId,
            productName: `Product ${productId}`,
            status: "skipped",
          });
        }
      }
      return { posted: 0, failed: 0, skipped: results.length, results };
    }),
});
