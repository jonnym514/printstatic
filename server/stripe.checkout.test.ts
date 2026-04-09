/**
 * Tests for the Stripe checkout tRPC procedure.
 * Uses a mocked Stripe client to avoid real API calls.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// Mock the stripe module before importing the router
vi.mock("stripe", () => {
  const mockCreate = vi.fn().mockResolvedValue({
    id: "cs_test_mock_session",
    url: "https://checkout.stripe.com/pay/cs_test_mock_session",
  });
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockCreate,
        },
      },
    })),
  };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(user?: TrpcContext["user"]): TrpcContext {
  return {
    user: user ?? null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("stripe.createCheckout", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_mock_key";
  });

  it("returns a checkout URL for valid product IDs", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.stripe.createCheckout({
      productIds: ["weekly-planner", "budget-planner"],
      origin: "https://pixelprintables.manus.space",
    });
    expect(result.url).toContain("checkout.stripe.com");
  });

  it("throws when no valid product IDs are provided", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.stripe.createCheckout({
        productIds: ["invalid-product-id"],
        origin: "https://pixelprintables.manus.space",
      })
    ).rejects.toThrow("No valid products in cart");
  });

  it("accepts a logged-in user context", async () => {
    const user: TrpcContext["user"] = {
      id: 42,
      openId: "user-42",
      email: "buyer@example.com",
      name: "Test Buyer",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(makeCtx(user));
    const result = await caller.stripe.createCheckout({
      productIds: ["habit-tracker"],
      origin: "https://pixelprintables.manus.space",
    });
    expect(result.url).toBeTruthy();
  });
});
