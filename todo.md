# Print Static — Project TODO

## Core Store
- [x] Homepage with hero, features, product grid, testimonials, CTA
- [x] Shop page with category filter
- [x] Product detail pages
- [x] Shopping cart with item management

## Payments (Stripe)
- [x] Database schema — orders table
- [x] Server-side Stripe checkout session creation (tRPC)
- [x] Stripe webhook handler (checkout.session.completed)
- [x] Cart page wired to live Stripe checkout
- [x] Order success page with download links
- [x] Vitest tests for Stripe checkout procedure

## Marketing Agent
- [x] Marketing Agent Dashboard (/marketing)
- [x] Content approval queue (first batch requires approval)
- [x] Platform setup guide (Pinterest, Instagram, TikTok, Email)
- [x] Email campaign manager
- [x] Strategy guide with traffic timeline
- [x] Weekly scheduled content generation (every Monday 8am)
- [x] Marketing Agent button in Navbar with pending badge

## Rebrand: PixelPrintables → Print Static
- [x] Update design system (colors, fonts, CSS tokens) to dark digital aesthetic
- [x] Update app title, meta tags, and Navbar branding to Print Static
- [x] Rewrite all page copy (hero, features, product descriptions) with digital voice
- [x] Redesign Home page with dark/digital look (Space Grotesk + Space Mono)
- [x] Update Shop, ProductDetail, Cart, OrderSuccess pages
- [x] Update Footer with printstatic.com branding
- [x] Update Stripe test mode notice and checkout copy
- [x] Update MarketingDashboard with Print Static branding

## Pending / Future
- [x] Real file delivery after purchase (upload actual PDFs to S3)
- [x] Order history page (/orders) for logged-in users
- [ ] Email receipt automation (Stripe → Mailchimp/Resend)
- [ ] Etsy cross-listing integration
- [ ] Pinterest Ads integration
- [ ] Generate new hero images matching digital aesthetic

## Product Expansion & Image Refresh
- [x] Generate dark digital-themed images for all existing products
- [x] Add 6+ new popular digital download products to the catalog
- [x] Upload all new images to CDN
- [x] Update products.ts with new items and CDN image URLs

## White Theme Redesign
- [x] Update CSS design tokens to white-dominant, black-accent palette
- [x] Update Navbar, Footer, and all page components for new theme
- [x] Regenerate all 12 product images on white/light backgrounds
- [x] Update product catalog CDN URLs with new images

## Image Fix & Product Expansion
- [x] Diagnose and fix missing product images (broken CDN URLs)
- [x] Re-upload all product images to CDN with working URLs
- [x] Add all additional products to catalog with correct images
- [ ] Verify all images display correctly in browser

## QA Audit & Bug Fixes
- [x] Audit all pages for visual/UI issues
- [x] Verify all 17 product images load correctly
- [x] Check all navigation links work
- [x] Verify Stripe checkout flow end-to-end
- [x] Fix stripeWebhook import path (doubled server/server/ path)
- [x] Verify shared/products.ts matches client/src/lib/products.ts
- [x] Check MarketingDashboard for broken references
- [x] Run all vitest tests
- [x] Final TypeScript check (0 errors)

## Pre-Launch Pages
- [x] Build Order History page (/orders) with download links for past purchases
- [x] Build Refund Policy page (/refund-policy)
- [x] Build Terms of Use page (/terms)
- [x] Build FAQ page (/faq)
- [x] Wire all footer links to new pages
- [x] Add all new routes to App.tsx

## File Upload & Digital Delivery System
- [x] Add product_files table to database schema
- [x] Build server-side S3 upload endpoint for admin PDF uploads
- [x] Build secure download link generation (time-limited signed URLs)
- [x] Build admin file upload panel (/admin/files)
- [x] Update Order Success page to serve real download links
- [x] Update Order History page to serve real download links
- [x] Write vitest tests for upload and download procedures

## PDF Generation & Upload
- [x] Generate placeholder PDFs for all 17 products
- [x] Upload all PDFs to S3 and register in database
- [x] Verify all download links work end-to-end

## Competitive Advantage Features
- [x] Product color/style variants (neutral, bold, dark, pastel) on product detail pages
- [x] Product bundles with bundle pricing (themed packs at 30% off)
- [x] Flash sale / countdown timer system with Deal of the Day
- [x] Customer reviews & star ratings system
- [x] Wishlist / save for later feature
- [x] Cross-sell "Customers also bought" on product pages
- [x] Free weekly download with email capture
- [x] AI Marketing Agent with real LLM content generation
- [x] SEO blog with AI-generated keyword-targeted articles
- [x] Autonomous Agent Dashboard (marketing, pricing, performance)
- [x] Loyalty points system
- [x] Referral/affiliate program page

## Logo & Icon Update
- [x] Upload icon and logo to CDN
- [x] Update favicon in index.html
- [x] Update Navbar to use logo image
- [x] Update VITE_APP_LOGO secret (via Settings → General in Management UI)

## Visual Polish
- [x] Make navbar logo larger
- [x] Redesign hero image with flair (larger, styled frame, decorative elements)

## Product Variants
- [x] Add color theme and style variant data to all products
- [x] Build color/style selector UI on ProductDetail page
- [x] Wire selected variant into cart and checkout metadata

## Paper Size Selector
- [x] Add paper size selector (A4, A5, US Letter) to product detail page

## Print Pack Quantity Selector
- [x] Add tiered quantity selector (1, 5, 10 copies) with pricing to ProductDetail
- [x] Update CartContext to support quantity and pack price
- [x] Update cart UI and checkout to reflect pack quantity and total

## Pack UX Improvements
- [x] Add 25-copy Gift Pack tier (30% off) to ProductDetail
- [x] Dynamic Add to Cart button showing savings for multi-packs
- [x] Persist cart to localStorage so it survives page refresh

## Conversion Improvements
- [x] Cart drawer/sidebar (slide-out on cart icon click)
- [x] Promo code input field in cart summary panel
- [x] Abandoned cart recovery email (24h trigger for logged-in users)

## Loyalty & Promo Enhancements
- [x] Add abandoned cart processing button to Agent Dashboard
- [x] Wire promo code to Stripe checkout (pass promotion_code to session)
- [x] Show loyalty points balance in cart drawer and order success page

## Rewards & Referral Program
- [x] Build Loyalty Points /rewards page (history, tier progress, redemption)
- [x] Build referral program (unique links, tracking, point rewards)
- [x] Create real Stripe promo codes (WELCOME10, SAVE20, BUNDLE30) — create in Stripe Dashboard
- [x] Wire referral page into navbar

## Color Variant Image Preview
- [x] Apply color tint overlay to product image when a color swatch is selected

## Per-Color Product Images
- [x] Generate real color-specific images for each product × color variant
- [x] Upload all variant images to CDN
- [x] Update product catalog with variantImages map (colorId → CDN URL)
- [x] Update ProductDetail to swap image on color selection (real image swap, no CSS filter)

## Style Variant Image Swap Fix
- [x] Diagnose why style selection does not update the product image
- [x] Generate style-specific product images for all products × styles (56 images)
- [x] Upload style images to CDN and update product catalog with styleImages map
- [x] Update ProductDetail to swap image on style selection (color takes priority, style as fallback)

## Style Selector Visual Improvement
- [x] Redesign style selector buttons to show thumbnail image previews so customers can see the difference at a glance

## Style Thumbnail Hover Zoom
- [x] Add hover zoom effect to style thumbnail images on ProductDetail

## Most Popular Style Badge
- [x] Add 'Most Popular' badge to the first (default) style card on the product detail page

## Shop Style Filter
- [x] Add style filter chips (Minimal, Bold, Illustrated, Structured) to the Shop page
- [x] Wire filtering logic so only products with a matching styleVariant are shown

## Color Swatches on Shop Grid Cards
- [x] Add color swatch dots to ProductCard showing available colorVariants

## Hero CTA Button Redesign
- [x] Rename 'Browse Files' button to 'Shop Now' and improve its visual design (teal, shadow, hover scale + arrow slide)

## Agent Button Admin-Only Visibility
- [x] Hide Agent navbar button from guests and regular users — only show for admin role

## Navbar Logo Prominence
- [x] Make the upper-left navbar logo more prominent — switched to square icon mark (h-10 w-10) + bold PRINT_STATIC wordmark beside it

## Hero Badge Removal
- [x] Remove 'digital_downloads.exe' badge from hero and close the empty space (reduced py-16/24 to py-10/16)

## Navbar Static Animation
- [x] Research static/noise animation techniques and design inspiration
- [x] Build animated static canvas/CSS component (StaticNoise.tsx) using offscreen canvas + random offset technique
- [x] Integrate static animation as a teal-tinted 18px accent bar at the very top of the navbar

## Post-Purchase Guest Download Fix
- [x] Inspect checkout session success URL and download page auth logic
- [x] Add public getDownloadLinksForSession procedure — validates via Stripe session_id, no login required
- [x] Update OrderSuccess page to use public endpoint with 3s polling fallback for webhook delay

## Post-Launch Tasks
- [x] Generate real PDF files for all 17 products and upload to S3 (seed script)
- [x] Verified all 17 files registered in database with correct productId, mimeType, fileSize
- [ ] Configure Stripe customer receipt emails (requires Stripe login — instructions provided)

## Automated Marketing System
- [x] Extend DB schema with email_queue, scheduled_posts, blog_posts tables
- [x] Post-purchase email sequence: download confirmation + tips (24h) + upsell (3d)
- [x] SEO blog autopilot: weekly AI-written blog posts targeting printable keywords
- [x] Weekly performance digest: Monday email with sales summary and action suggestions
- [x] Social media content calendar: AI generates weekly post queue for Instagram/Pinterest/Twitter
- [x] Marketing router registered in routers.ts
- [x] Blog page at /blog and BlogPost at /blog/:slug
- [x] Blog link added to navbar

## Pinterest Marketing Agent (Automated)
- [x] Add pinterest_tokens and pinterest_pins tables to DB schema
- [x] Create Pinterest service module (server/pinterest.ts) with OAuth, board listing, pin creation, AI image generation
- [x] Create Pinterest tRPC router (server/routers/pinterest.ts) with getStatus, getAuthUrl, getBoards, postProducts, getPinHistory, getPinStats, disconnect
- [x] Create Pinterest OAuth callback Express route (server/pinterestOAuth.ts) at /api/pinterest/callback
- [x] Register Pinterest OAuth routes in server/_core/index.ts
- [x] Register Pinterest router in server/routers.ts
- [x] Build Pinterest Agent admin UI page (/agent/pinterest) with connect, board mapping, product selector, run agent, results, pin history
- [x] Add Pinterest Agent quick-link button to Agent Dashboard
- [x] Register /agent/pinterest route in App.tsx
- [x] Run DB migration (pnpm db:push) — tables created successfully
- [x] Write vitest tests for Pinterest agent (16 tests passing)
- [ ] Add PINTEREST_APP_ID and PINTEREST_APP_SECRET to Secrets (user must register Pinterest app)

## Privacy Policy & Cookie Consent
- [x] Build Privacy Policy page (/privacy) with data collection, cookies, Pinterest/Stripe permissions sections
- [x] Add cookie consent banner component (CookieBanner.tsx) shown on first visit, stored in localStorage
- [x] Wire /privacy route in App.tsx
- [x] Add Privacy Policy link to Footer
- [x] Add Privacy Policy link to cookie banner
