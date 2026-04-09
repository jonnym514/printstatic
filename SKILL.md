---
name: digital-downloads-store
description: "End-to-end workflow for building a production-ready digital downloads e-commerce store. Use for: creating a store that sells downloadable files (PDFs, templates, printables, art, fonts, software), with Stripe payments, S3 file delivery, product variants, bundles, reviews, wishlist, loyalty points, flash sales, an AI marketing agent, and an admin file upload panel. Covers database schema, tRPC procedures, frontend pages, competitive differentiators, and autonomous agent setup."
---

# Digital Downloads Store Skill

## Overview

This skill captures the complete process for building a digital downloads storefront on the Manus web-db-user template. The store sells downloadable files (PDFs, templates, printables) with instant delivery after Stripe checkout.

Read `references/architecture.md` for the full data model and file structure. Read `references/competitive-features.md` for the competitive differentiator checklist. Read `references/agent-setup.md` for the autonomous marketing agent workflow.

---

## Phase 1 — Scaffold & Configure

1. Use `webdev_init_project` with the `web-db-user` template.
2. Add Stripe via `webdev_add_feature stripe`.
3. Set `VITE_APP_TITLE` to the store name via `webdev_request_secrets`.
4. Create `todo.md` immediately listing all planned features.

---

## Phase 2 — Product Catalog

Define all products in `client/src/lib/products.ts` and `shared/products.ts`.

Each product must include:
- `id`, `name`, `price`, `category`, `image` (CDN URL), `description`, `longDescription`
- `fileFormat`, `pages`, `rating`, `downloads`, `tags`
- `colorVariants`: array of `{ name, hex, label }` — e.g. Neutral, Bold, Dark, Pastel
- `styleVariants`: array of `{ name, description }` — e.g. Minimalist, Modern, Classic, Playful
- `bundleIds`: array of product IDs that can be purchased together as a bundle

Upload all images with `manus-upload-file --webdev` and use CDN URLs only. Never store images in `client/public/` or `client/src/assets/`.

---

## Phase 3 — Database Schema

Extend `drizzle/schema.ts` with these tables beyond the default `users` table:

| Table | Purpose |
|---|---|
| `productFiles` | S3 key + URL for each product's downloadable file |
| `orders` | Stripe session ID, user ID, product IDs, status |
| `reviews` | Star rating + comment per product per user |
| `wishlistItems` | Saved products per user |
| `loyaltyPoints` | Points balance and transaction log per user |
| `flashSales` | Discount %, start/end timestamps, product scope |
| `blogPosts` | AI-generated SEO articles |
| `emailSubscribers` | Email capture for marketing |
| `agentLogs` | Log of all autonomous agent actions |

Run `pnpm db:push` after every schema change. See `references/architecture.md` for full column definitions.

---

## Phase 4 — tRPC Routers

Split routers into `server/routers/<feature>.ts` files. Register all in `server/routers.ts`.

| Router file | Key procedures |
|---|---|
| `stripe.ts` | `createCheckout`, `webhook` (POST `/api/stripe/webhook`) |
| `files.ts` | `uploadFile` (admin), `getDownloadLinks` (protected), `deleteFile` (admin) |
| `reviews.ts` | `addReview`, `getReviews`, `getUserReview` |
| `wishlist.ts` | `addToWishlist`, `removeFromWishlist`, `getWishlist` |
| `flashSales.ts` | `getActiveSale`, `createSale` (admin), `endSale` (admin) |
| `agent.ts` | `generateContent`, `generateBlogPost`, `generateReport`, `subscribeEmail` |

**Stripe webhook** — register with `express.raw()` BEFORE `express.json()`:
```ts
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
```

**Admin guard:**
```ts
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
  return next({ ctx });
});
```

**Secure download links** — always verify ownership before generating presigned URLs:
```ts
const order = await db.getOrderByUserAndProduct(ctx.user.id, productId);
if (!order) throw new TRPCError({ code: 'FORBIDDEN' });
const { url } = await storageGet(file.fileKey, 3600); // 1-hour expiry
```

---

## Phase 5 — Frontend Pages

| Route | Page | Notes |
|---|---|---|
| `/` | `Home.tsx` | Hero, features strip, product grid, bundle CTA, email subscribe |
| `/shop` | `Shop.tsx` | Filterable product grid with category tabs |
| `/product/:id` | `ProductDetail.tsx` | Variants, pack selector, reviews, wishlist, cross-sell |
| `/bundles` | `Bundles.tsx` | Bundle packs with savings highlighted |
| `/cart` | `Cart.tsx` | Line items with pack qty, order summary, Stripe checkout |
| `/orders` | `Orders.tsx` | Purchase history with download links |
| `/order-success` | `OrderSuccess.tsx` | Post-purchase download links |
| `/admin/files` | `AdminFiles.tsx` | Admin-only PDF upload panel |
| `/agent` | `AgentDashboard.tsx` | AI marketing agent with content generation |

### Product Detail — required selectors (all must be chosen before Add to Cart)
1. **Color variant** — circular swatch buttons
2. **Style variant** — 2-column card grid
3. **Paper size** — US Letter / A4 / A5 with dimension labels
4. **Print Pack** — Single / 5-Pack (−15%) / 10-Pack (−25%) / Gift Pack 25× (−30%)

Add to Cart button label must dynamically show savings:
```
"Add 5-Pack — $16.99 · Save $3.00"
```

### CartContext — localStorage persistence
```ts
const [items, setItems] = useState<CartItem[]>(() => {
  try { return JSON.parse(localStorage.getItem('printstatic_cart') ?? '[]'); } catch { return []; }
});
useEffect(() => { localStorage.setItem('printstatic_cart', JSON.stringify(items)); }, [items]);
```

CartItem shape: `{ product, packQty: number, linePrice: number }`. Use `linePrice` (pack total), not `product.price * qty`, to correctly reflect pack discounts in cart totals.

---

## Phase 6 — File Upload & Delivery

### Admin upload flow
1. Admin visits `/admin/files` (role-gated — show sign-in button if not authenticated).
2. Selects a product, drags a PDF/ZIP (≤50 MB).
3. Frontend POSTs multipart to a tRPC mutation.
4. Server calls `storagePut(fileKey, buffer, mimeType)` → saves `{ fileKey, url, productId }` to `productFiles`.

### Customer download flow
1. After Stripe `checkout.session.completed` webhook fires, insert a row into `orders`.
2. On `/order-success?session_id=...`, call `getDownloadLinks({ sessionId })`.
3. Server verifies ownership via `orders` table, calls `storageGet(fileKey, 3600)`, returns signed URL.
4. Same flow on `/orders` for repeat downloads.

### Bulk placeholder PDF generation
Use `scripts/generate_pdfs.py` to create placeholder PDFs for all products before real files are ready. Then upload via `scripts/upload_pdfs.mjs`.

---

## Phase 7 — Competitive Differentiators

See `references/competitive-features.md` for the full checklist. Key items:

- **Bundles** — 3–5 themed packs at 25–33% off. Show per-item savings.
- **Flash sales** — countdown timer, Deal of the Day badge, admin controls.
- **Reviews** — verified purchase gate, star rating, display on product page.
- **Wishlist** — heart icon on product cards and detail page.
- **Cross-sell** — "You Might Also Like" on product detail (same category, exclude current).
- **Email capture** — homepage subscribe section, welcome email via agent.
- **Loyalty points** — award on purchase, redeem at checkout.
- **SEO blog** — AI-generated keyword-targeted articles via agent.

---

## Phase 8 — Autonomous Agent

The agent lives at `/agent` and uses `invokeLLM` server-side. It generates:

- Platform-specific social posts (Pinterest, Instagram, TikTok, Email)
- SEO blog articles from a keyword
- Email campaign copy with subject line and CTA
- Weekly performance reports with actionable recommendations

See `references/agent-setup.md` for LLM prompt templates and scheduling pattern.

---

## Phase 9 — Branding & Polish

- Upload logo (full wordmark) and icon (square mark) via `manus-upload-file --webdev`.
- Set logo in `Navbar.tsx` as `<img src={LOGO_CDN_URL} className="h-10" />`.
- **Do NOT show both icon and logo side by side** if the icon is already embedded in the logo image.
- Convert icon to `favicon.ico` with Pillow: `Image.open('icon.webp').save('favicon.ico', sizes=[(32,32),(64,64)])`.
- Place `favicon.ico` in `client/public/` and reference in `client/index.html`.
- Update `VITE_APP_LOGO` via **Settings → General** in the Management UI.

---

## Phase 10 — Domain & Launch

1. Buy domain via **Settings → Domains** in the Management UI (auto-connects, no DNS config needed).
2. Run `pnpm test` — all tests must pass before publish.
3. `webdev_save_checkpoint` → click **Publish** in Management UI header.
4. Instruct user to complete Stripe KYC for live payments.
5. Test with card `4242 4242 4242 4242`, any future date, any CVC.

---

## Key Pitfalls

- Never store images/media in `client/public/` — causes deployment timeout. Always use CDN URLs.
- Never show both the icon and the logo side by side if the icon is already part of the logo image.
- Always register the Stripe webhook route with `express.raw()` BEFORE `express.json()`.
- Always verify order ownership server-side before returning download links.
- Always use `window.location.origin` (never hardcoded domain) for Stripe `success_url`/`cancel_url`.
- CartItem must use `linePrice` (total for the pack), not `product.price * qty`, to correctly reflect pack discounts.
- Admin pages must show a **Sign In** button when the user is unauthenticated — do not silently redirect or show a blank page.
