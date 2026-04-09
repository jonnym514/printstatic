/**
 * Pinterest API v5 service
 * Handles OAuth flow, board management, and pin creation.
 */
import { getDb } from "./db";
import { pinterestTokens, pinterestPins } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./env";
import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";

const PINTEREST_API = "https://api.pinterest.com/v5";
const PINTEREST_AUTH = "https://www.pinterest.com/oauth";

// Product image CDN base (same as client/src/lib/products.ts)
const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663457026858/i7wpi7roPPicgqaW78ePG8";

// Default product images by product ID (minimal style preferred for pins)
const PRODUCT_IMAGES: Record<string, string> = {
  "weekly-planner": `${CDN}/weekly-planner-minimal_d96d96e6.png`,
  "budget-planner": `${CDN}/budget-planner-minimal_bccf9396.png`,
  "habit-tracker": `${CDN}/habit-tracker-mint_97c3a2be.png`,
  "goal-workbook": `${CDN}/goal-workbook-minimal_b0c2f3a1.png`,
  "meal-planner": `${CDN}/meal-planner-minimal_a1b2c3d4.png`,
  "journal-bundle": `${CDN}/journal-bundle-minimal_e5f6a7b8.png`,
  "resume-bundle": `${CDN}/resume-bundle-minimal_c9d0e1f2.png`,
  "wall-art-geometric": `${CDN}/wall-art-geometric-minimal_a3b4c5d6.png`,
  "typography-quotes": `${CDN}/typography-quotes-minimal_e7f8a9b0.png`,
  "wedding-invite": `${CDN}/wedding-invite-minimal_c1d2e3f4.png`,
  "birthday-invite": `${CDN}/birthday-invite-minimal_a5b6c7d8.png`,
  "business-card": `${CDN}/business-card-minimal_e9f0a1b2.png`,
  "kids-activity": `${CDN}/kids-activity-minimal_c3d4e5f6.png`,
  "social-calendar": `${CDN}/social-calendar-minimal_a7b8c9d0.png`,
  "instagram-templates": `${CDN}/instagram-templates-minimal_e1f2a3b4.png`,
  "notion-template": `${CDN}/notion-template-minimal_c5d6e7f8.png`,
  "brand-kit": `${CDN}/brand-kit-minimal_a9b0c1d2.png`,
};

// ── OAuth helpers ─────────────────────────────────────────────────────────────

export function getPinterestAuthUrl(redirectUri: string, state: string): string {
  const scopes = [
    "boards:read",
    "boards:write",
    "pins:read",
    "pins:write",
    "user_accounts:read",
  ].join(",");

  const params = new URLSearchParams({
    client_id: ENV.pinterestAppId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state,
  });

  return `${PINTEREST_AUTH}/?${params.toString()}`;
}

export async function exchangePinterestCode(
  code: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  scope: string;
}> {
  const credentials = Buffer.from(
    `${ENV.pinterestAppId}:${ENV.pinterestAppSecret}`
  ).toString("base64");

  const res = await fetch(`${PINTEREST_API}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest token exchange failed: ${err}`);
  }

  return res.json();
}

export async function refreshPinterestToken(
  refreshToken: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  const credentials = Buffer.from(
    `${ENV.pinterestAppId}:${ENV.pinterestAppSecret}`
  ).toString("base64");

  const res = await fetch(`${PINTEREST_API}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest token refresh failed: ${err}`);
  }

  return res.json();
}

// ── Token DB helpers ──────────────────────────────────────────────────────────

export async function savePinterestToken(
  userId: number,
  tokenData: {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    scope?: string;
    expiresIn?: number;
    pinterestUserId?: string;
    pinterestUsername?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const expiresAt = tokenData.expiresIn
    ? new Date(Date.now() + tokenData.expiresIn * 1000)
    : undefined;

  // Upsert — delete existing then insert
  await db.delete(pinterestTokens).where(eq(pinterestTokens.userId, userId));
  await db.insert(pinterestTokens).values({
    userId,
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken ?? null,
    tokenType: tokenData.tokenType ?? "bearer",
    scope: tokenData.scope ?? null,
    expiresAt: expiresAt ?? null,
    pinterestUserId: tokenData.pinterestUserId ?? null,
    pinterestUsername: tokenData.pinterestUsername ?? null,
  });
}

export async function getPinterestToken(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [token] = await db
    .select()
    .from(pinterestTokens)
    .where(eq(pinterestTokens.userId, userId))
    .limit(1);
  return token ?? null;
}

export async function getValidAccessToken(userId: number): Promise<string> {
  const token = await getPinterestToken(userId);
  if (!token) throw new Error("Pinterest account not connected");

  // Refresh if expiring within 5 minutes
  if (token.expiresAt && token.refreshToken) {
    const fiveMin = 5 * 60 * 1000;
    if (token.expiresAt.getTime() - Date.now() < fiveMin) {
      const refreshed = await refreshPinterestToken(token.refreshToken);
      await savePinterestToken(userId, {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? token.refreshToken,
        expiresIn: refreshed.expires_in,
        pinterestUserId: token.pinterestUserId ?? undefined,
        pinterestUsername: token.pinterestUsername ?? undefined,
      });
      return refreshed.access_token;
    }
  }

  return token.accessToken;
}

export async function disconnectPinterest(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(pinterestTokens).where(eq(pinterestTokens.userId, userId));
}

// ── Pinterest API calls ───────────────────────────────────────────────────────

export async function getPinterestUserInfo(accessToken: string) {
  const res = await fetch(`${PINTEREST_API}/user_account`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Pinterest user info failed: ${await res.text()}`);
  return res.json();
}

export async function getPinterestBoards(accessToken: string): Promise<{
  id: string;
  name: string;
  description?: string;
  pin_count?: number;
}[]> {
  const res = await fetch(`${PINTEREST_API}/boards?page_size=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Pinterest boards fetch failed: ${await res.text()}`);
  const data = await res.json();
  return data.items ?? [];
}

export async function createPinterestPin(
  accessToken: string,
  params: {
    boardId: string;
    title: string;
    description: string;
    imageUrl: string;
    link: string;
  }
): Promise<{ id: string }> {
  const body = {
    board_id: params.boardId,
    title: params.title,
    description: params.description,
    link: params.link,
    media_source: {
      source_type: "image_url",
      url: params.imageUrl,
    },
  };

  const res = await fetch(`${PINTEREST_API}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest pin creation failed: ${err}`);
  }

  return res.json();
}

// ── AI Pin generation ─────────────────────────────────────────────────────────

export async function generatePinDescription(
  productName: string,
  productDescription: string,
  price: number
): Promise<{ title: string; description: string }> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a Pinterest marketing expert for a digital downloads store. Generate engaging, keyword-rich pin content that drives clicks and saves.",
      },
      {
        role: "user",
        content: `Create a Pinterest pin for this product:
Product: ${productName}
Description: ${productDescription}
Price: $${price}
Store URL: https://www.printstatic.com

Return JSON with:
- title: compelling pin title (max 100 chars)
- description: keyword-rich description (150-300 words) with 5 relevant hashtags at the end`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pin_content",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["title", "description"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = response.choices[0]?.message?.content;
  const content = typeof raw === "string" ? raw : JSON.stringify(raw ?? {});
  try {
    return JSON.parse(content);
  } catch {
    return {
      title: `${productName} — Instant Download`,
      description: `${productDescription} Available at printstatic.com for $${price}. Instant digital download. #printable #digitaldownload #instantdownload #printables #homedecor`,
    };
  }
}

export async function generatePinImage(
  productName: string,
  productDescription: string,
  productImageUrl: string,
  price: number
): Promise<string> {
  const prompt = `Create a Pinterest pin image (portrait format, 2:3 ratio) for a digital download product.
Product: "${productName}"
Description: ${productDescription}
Price: $${(price / 100).toFixed(2)}

Design requirements:
- Clean, modern, Scandinavian minimalist aesthetic
- White/cream background with subtle texture
- Product mockup shown prominently (printed on paper/desk setting)
- Bold product name text at the bottom
- Small "Instant Download" badge in corner
- Teal accent color (#00B4B4)
- Professional, Pinterest-worthy composition`;

  try {
    const { url } = await generateImage({
      prompt,
      originalImages: [{ url: productImageUrl, mimeType: "image/jpeg" }],
    });
    return url ?? productImageUrl;
  } catch {
    // Fall back to original product image if AI generation fails
    return productImageUrl;
  }
}

// ── Pin history helpers ───────────────────────────────────────────────────────

export async function getPinHistory(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(pinterestPins)
    .orderBy(pinterestPins.createdAt)
    .limit(limit);
}

export async function getPinStats() {
  const db = await getDb();
  if (!db) return { total: 0, posted: 0, failed: 0, pending: 0 };
  const rows = await db.select().from(pinterestPins);
  return {
    total: rows.length,
    posted: rows.filter((r) => r.status === "posted").length,
    failed: rows.filter((r) => r.status === "failed").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };
}

// ── Full automation: post all products ────────────────────────────────────────

export interface BoardMapping {
  boardId: string;
  boardName: string;
  productIds: string[];
}

export interface PinResult {
  productId: string;
  productName: string;
  status: "posted" | "failed" | "skipped";
  pinId?: string;
  error?: string;
}

export async function postProductsToBoards(
  userId: number,
  boardMappings: BoardMapping[]
): Promise<{ posted: number; failed: number; results: PinResult[] }> {
  const accessToken = await getValidAccessToken(userId);
  const db = await getDb();
  const results: PinResult[] = [];
  let posted = 0;
  let failed = 0;

  // Import PRODUCT_CATALOG from shared (server-safe)
  const { PRODUCT_CATALOG } = await import("../shared/products");

  for (const mapping of boardMappings) {
    for (const productId of mapping.productIds) {
      const product = PRODUCT_CATALOG.find((p) => p.id === productId);
      if (!product) {
        results.push({ productId, productName: productId, status: "failed", error: "Product not found in catalog" });
        failed++;
        continue;
      }

      try {
        // Generate AI-written pin title + description
        const { title, description } = await generatePinDescription(
          product.name,
          product.description,
          product.price
        );

        // Get product image URL (prefer minimal style)
        const imageUrl = PRODUCT_IMAGES[productId] ?? `${CDN}/ps-w-${productId}_default.png`;

        // Generate AI pin image using the product image as reference
        const pinImageUrl = await generatePinImage(
          product.name,
          product.description,
          imageUrl,
          product.price * 100 // convert to cents for display
        );

        // Post to Pinterest
        const productUrl = `https://www.printstatic.com/product/${productId}`;
        const pin = await createPinterestPin(accessToken, {
          boardId: mapping.boardId,
          title,
          description,
          imageUrl: pinImageUrl,
          link: productUrl,
        });

        // Record in DB
        if (db) {
          await db.insert(pinterestPins).values({
            productId,
            boardId: mapping.boardId,
            boardName: mapping.boardName,
            pinId: pin.id,
            title,
            description,
            imageUrl: pinImageUrl,
            link: productUrl,
            status: "posted",
            postedAt: new Date(),
          });
        }

        results.push({ productId, productName: product.name, status: "posted", pinId: pin.id });
        posted++;

        // Rate limit: 1.2s between pins to avoid Pinterest API throttling
        await new Promise((r) => setTimeout(r, 1200));
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";

        if (db) {
          await db.insert(pinterestPins).values({
            productId,
            boardId: mapping.boardId,
            boardName: mapping.boardName,
            status: "failed",
            errorMessage: errorMsg,
          });
        }

        results.push({ productId, productName: product.name, status: "failed", error: errorMsg });
        failed++;
      }
    }
  }

  return { posted, failed, results };
}
