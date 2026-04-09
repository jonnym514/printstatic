# Competitive Features Checklist

Research basis: Top Etsy digital download sellers ($93K+/year), Gumroad, Creative Market, Design Bundles.

## Must-Have Differentiators

| Feature | Implementation | Impact |
|---|---|---|
| Instant download | S3 presigned URL after Stripe webhook | Baseline expectation |
| Color variants | Swatch buttons on product detail | Reduces returns, increases conversion |
| Style variants | Card grid (Minimalist/Modern/Classic/Playful) | Broader appeal |
| Paper size selector | US Letter / A4 / A5 with dimensions | Reduces post-purchase support |
| Print Pack tiers | 1 / 5 (−15%) / 10 (−25%) / 25 (−30%) | Increases AOV significantly |
| Dynamic savings label | "Add 5-Pack — $16.99 · Save $3.00" | Reinforces value at decision point |
| Bundle packs | 3–5 themed bundles at 25–33% off | Increases AOV, reduces decision fatigue |
| Customer reviews | Verified purchase gate, star rating | Social proof, SEO benefit |
| Wishlist | Heart icon, saved products page | Reduces abandonment, enables retargeting |
| Cross-sell | "You Might Also Like" (same category) | Increases items per order |
| Flash sale / countdown | Deal of the Day with timer | Creates urgency |
| Email capture | Homepage subscribe + welcome email | Owned audience, repeat sales |
| Cart persistence | localStorage | Reduces abandonment from accidental navigation |
| Free weekly download | Email gate on homepage | List building |

## Nice-to-Have (Phase 2)

| Feature | Notes |
|---|---|
| Loyalty points | Award on purchase, redeem at checkout |
| Referral program | Unique link, % commission on referred sales |
| Abandoned cart email | Trigger after 24h if cart not checked out |
| Cart drawer/sidebar | Slide-out instead of full cart page |
| Promo code input | Stripe `allow_promotion_codes: true` already enabled |
| Color preview on image | Tint product image when color swatch selected |
| Paper size tooltip | "Not sure? US Letter for US printers, A4 for Europe" |
| Gift Pack marketing | Target teachers, event planners, gifters |
| SEO blog | AI-generated keyword articles for organic traffic |
| Pinterest auto-post | Pinterest API integration via agent |

## Pricing Strategy (based on competitive research)

- Single item: $3.99–$9.99 (impulse buy range)
- 5-Pack: 15% off single price × 5
- 10-Pack: 25% off single price × 10
- Gift Pack (25×): 30% off single price × 25
- Bundles: 25–33% off sum of individual prices
- Flash sale: 20–40% off for 24–72 hours
- Free item: 1 product permanently free (email gate) to build list

## Design Principles That Convert

1. Show the file format and page count prominently — buyers want to know exactly what they get.
2. Display download count ("12,000+ downloads") — social proof without reviews.
3. Use "instant download" language everywhere — removes the mental barrier of waiting.
4. Show the actual price savings in dollar amounts, not just percentages.
5. Trust badges near the Add to Cart button: "Secure Checkout · Instant Delivery · Print Unlimited Copies".
