/*
 * Stripe tRPC Router
 * - createCheckout: creates a Stripe Checkout Session for a cart of products
 * - getOrders: returns the current user's order history
 */

import { z } from "zod";
import Stripe from "stripe";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getProductById } from "../../shared/products";
import { getOrdersByUserId, getOrdersByEmail } from "../db";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

export const stripeRouter = router({
  /**
   * Create a Stripe Checkout Session for a list of product IDs.
   * Returns { url } — the hosted Stripe checkout URL.
   */
  createCheckout: publicProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
        origin: z.string().url(),
        promoCode: z.string().optional(),
        packDetails: z.array(z.object({
          productId: z.string(),
          packQty: z.number().int().min(1),
          linePrice: z.number().positive(),
          colorTheme: z.string().optional(),
          styleVariant: z.string().optional(),
          paperSize: z.string().optional(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();

      // Build line items — validate each product ID against the catalog
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      const validProductIds: string[] = [];

      // Build a map of pack details for quick lookup
      const packMap = new Map(input.packDetails?.map((p) => [p.productId, p]) ?? []);

      for (const productId of input.productIds) {
        const product = getProductById(productId);
        if (!product) continue;

        const pack = packMap.get(productId);
        const unitAmount = pack ? Math.round(pack.linePrice * 100) : Math.round(product.price * 100);
        const qty = pack?.packQty ?? 1;
        const variantDesc = [
          pack?.colorTheme && `Color: ${pack.colorTheme}`,
          pack?.styleVariant && `Style: ${pack.styleVariant}`,
          pack?.paperSize && `Size: ${pack.paperSize}`,
          qty > 1 && `${qty}-copy Print Pack`,
        ].filter(Boolean).join(' · ');

        validProductIds.push(productId);
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: qty > 1 ? `${product.name} (${qty}-Pack)` : product.name,
              description: variantDesc || product.description,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        });
      }

      if (lineItems.length === 0) {
        throw new Error("No valid products in cart");
      }

      const user = ctx.user;
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${input.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/cart`,
        allow_promotion_codes: true,
        metadata: {
          product_ids: JSON.stringify(validProductIds),
          user_id: user ? user.id.toString() : "",
          customer_email: user?.email ?? "",
          customer_name: user?.name ?? "",
        },
        client_reference_id: user ? user.id.toString() : undefined,
      };

      // Pre-fill email if user is logged in
      if (user?.email) {
        sessionParams.customer_email = user.email;
      }

      // Apply promo code if provided — look up the promotion code object in Stripe
      // and attach it as a discount. allow_promotion_codes stays true so customers
      // can also enter codes manually at checkout.
      if (input.promoCode?.trim()) {
        try {
          const promoCodes = await stripe.promotionCodes.list({
            code: input.promoCode.trim().toUpperCase(),
            active: true,
            limit: 1,
          });
          if (promoCodes.data.length > 0) {
            sessionParams.discounts = [{ promotion_code: promoCodes.data[0].id }];
            // When a discount is pre-applied, allow_promotion_codes must be false
            sessionParams.allow_promotion_codes = false;
          }
        } catch {
          // If promo lookup fails, fall through and let customer enter it manually
          console.warn('[Stripe] Promo code lookup failed for:', input.promoCode);
        }
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return { url: session.url! };
    }),

  /**
   * Get the current user's order history.
   * Falls back to email-based lookup for guest orders.
   */
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const orders = await getOrdersByUserId(ctx.user.id);
    return orders.map((o) => ({
      id: o.id,
      stripeSessionId: o.stripeSessionId,
      productIds: o.productIds as string[],
      amountTotal: o.amountTotal,
      currency: o.currency,
      status: o.status,
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      createdAt: o.createdAt,
    }));
  }),
});
