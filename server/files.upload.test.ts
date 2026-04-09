/**
 * Tests for the files tRPC router.
 * Covers: admin-only upload guard, non-admin rejection, and download link auth check.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  insertProductFile: vi.fn().mockResolvedValue(undefined),
  getFilesByProductId: vi.fn().mockResolvedValue([
    {
      id: 1,
      productId: "weekly-planner",
      fileName: "weekly_planner.pdf",
      s3Key: "product-files/weekly-planner/123-weekly_planner.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
      createdAt: new Date(),
    },
  ]),
  getAllProductFiles: vi.fn().mockResolvedValue([]),
  deleteProductFile: vi.fn().mockResolvedValue(undefined),
  getOrdersByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      stripeSessionId: "cs_test_123",
      productIds: ["weekly-planner"],
      amountTotal: 799,
      currency: "usd",
      status: "completed",
      customerEmail: "test@example.com",
      createdAt: new Date(),
    },
  ]),
}));

// ─── Mock storage helpers ─────────────────────────────────────────────────────
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://cdn.example.com/test.pdf" }),
  storageGet: vi.fn().mockResolvedValue({ key: "test-key", url: "https://cdn.example.com/test.pdf?token=abc" }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAdminCtx() {
  return {
    user: { id: 1, role: "admin" as const, name: "Admin", email: "admin@example.com", openId: "admin-open-id" },
    req: {} as any,
    res: {} as any,
  };
}

function makeUserCtx() {
  return {
    user: { id: 2, role: "user" as const, name: "User", email: "user@example.com", openId: "user-open-id" },
    req: {} as any,
    res: {} as any,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("files router — admin guard", () => {
  it("rejects non-admin users from uploadFile", async () => {
    const { filesRouter } = await import("./routers/files");
    const caller = filesRouter.createCaller(makeUserCtx() as any);

    await expect(
      caller.uploadFile({
        productId: "weekly-planner",
        fileName: "test.pdf",
        fileData: Buffer.from("test").toString("base64"),
        mimeType: "application/pdf",
        fileSize: 4,
      })
    ).rejects.toThrow(TRPCError);
  });

  it("rejects non-admin users from getAllFiles", async () => {
    const { filesRouter } = await import("./routers/files");
    const caller = filesRouter.createCaller(makeUserCtx() as any);

    await expect(caller.getAllFiles()).rejects.toThrow(TRPCError);
  });

  it("allows admin users to call getAllFiles", async () => {
    const { filesRouter } = await import("./routers/files");
    const caller = filesRouter.createCaller(makeAdminCtx() as any);

    const result = await caller.getAllFiles();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("files router — download links", () => {
  it("returns download links for products the user has purchased", async () => {
    const { filesRouter } = await import("./routers/files");
    const caller = filesRouter.createCaller(makeUserCtx() as any);

    const result = await caller.getDownloadLinks({ productIds: ["weekly-planner"] });
    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe("weekly-planner");
    expect(result[0].downloadUrl).toContain("https://");
  });

  it("returns empty array for products the user has NOT purchased", async () => {
    const { filesRouter } = await import("./routers/files");
    const caller = filesRouter.createCaller(makeUserCtx() as any);

    const result = await caller.getDownloadLinks({ productIds: ["brand-kit"] });
    expect(result).toHaveLength(0);
  });
});
