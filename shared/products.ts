/**
 * Shared product catalog — used by both client and server.
 * Server uses this to build Stripe line items and validate prices.
 * Client imports from client/src/lib/products.ts for full product data.
 *
 * IMPORTANT: IDs and prices here MUST stay in sync with client/src/lib/products.ts
 */
export type ColorVariant = {
  id: string;       // e.g. "neutral", "bold", "dark", "pastel"
  label: string;    // e.g. "Neutral Tones"
  hex: string;      // preview swatch color
};

export interface ProductCatalogItem {
  id: string;
  name: string;
  /** Price in USD dollars */
  price: number;
  /** Sale price — if set, this is the active price */
  salePrice?: number;
  description: string;
  category: string;
  /** Available color/style variants */
  variants?: ColorVariant[];
  /** If true, this is a bundle of multiple products */
  isBundle?: boolean;
  /** Product IDs included in this bundle */
  bundleProductIds?: string[];
  /** Whether this product is featured in flash sale */
  flashSale?: boolean;
  /** Additional preview images for the product gallery */
  previewImages?: string[];
}

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  // ── Planners ──────────────────────────────────────────────────────────────
  {
    id: "weekly-planner",
    name: "Weekly Planner Bundle",
    price: 7.99,
    description: "7-day layout with time blocks, priorities, and habit tracker. Print-ready PDF.",
    category: "Planners",
  },
  {
    id: "budget-planner",
    name: "Budget Planner Spreadsheet",
    price: 9.99,
    description: "Monthly budget tracker with income, expenses, savings goals, and debt payoff.",
    category: "Planners",
  },
  {
    id: "habit-tracker",
    name: "Habit Tracker — 30 Day",
    price: 4.99,
    description: "Track up to 20 habits daily. Monthly overview grid with streak counter.",
    category: "Planners",
  },
  {
    id: "goal-workbook",
    name: "Goal Setting Workbook",
    price: 12.99,
    description: "Annual goal-setting system with vision board prompts, quarterly milestones, and weekly check-ins.",
    category: "Planners",
  },
  {
    id: "meal-planner",
    name: "Meal Planner + Grocery List",
    price: 5.99,
    description: "Weekly meal plan grid with breakfast, lunch, dinner, and a tear-off grocery list.",
    category: "Planners",
  },
  {
    id: "journal-bundle",
    name: "Daily Journal + Gratitude Bundle",
    price: 8.99,
    description: "Morning routine journal, gratitude prompts, and evening reflection pages. 30-day system.",
    category: "Planners",
  },
  // ── Templates ─────────────────────────────────────────────────────────────
  {
    id: "resume-bundle",
    name: "Resume Template Bundle",
    price: 14.99,
    description: "5 ATS-friendly resume templates in minimal, bold, and creative styles. Canva + Word.",
    category: "Templates",
  },
  {
    id: "social-calendar",
    name: "Social Media Content Calendar",
    price: 11.99,
    description: "90-day content calendar with post ideas, caption templates, and hashtag banks.",
    category: "Templates",
  },
  {
    id: "social-templates",
    name: "Instagram Post Templates",
    price: 19.99,
    description: "50 Canva Instagram post templates — quotes, carousels, reels covers, and stories.",
    category: "Templates",
  },
  {
    id: "notion-template",
    name: "Notion Productivity Dashboard",
    price: 16.99,
    description: "All-in-one Notion workspace with task manager, habit tracker, reading list, and journal.",
    category: "Templates",
  },
  {
    id: "brand-kit",
    name: "Brand Identity Kit",
    price: 24.99,
    description: "Complete brand kit with logo templates, color palette guide, font pairing guide, and brand board.",
    category: "Templates",
  },
  {
    id: "business-card",
    name: "Business Card Template Pack",
    price: 6.99,
    description: "4 professional business card designs — minimal, bold, creative, and classic. Print-ready.",
    category: "Templates",
  },
  // ── Wall Art ──────────────────────────────────────────────────────────────
  {
    id: "wall-art-geometric",
    name: "Geometric Wall Art Set",
    price: 5.99,
    description: "6 minimalist geometric prints in black, white, and gold. Print at any size.",
    category: "Wall Art",
  },
  {
    id: "wall-art-quotes",
    name: "Typography Quote Prints",
    price: 4.99,
    description: "8 motivational quote prints with bold typographic layouts. Gallery wall ready.",
    category: "Wall Art",
  },
  // ── Invitations ───────────────────────────────────────────────────────────
  {
    id: "wedding-invite",
    name: "Wedding Invitation Suite",
    price: 18.99,
    description: "Elegant wedding invitation, RSVP card, and envelope liner. Fully editable in Canva.",
    category: "Invitations",
  },
  {
    id: "party-invite",
    name: "Birthday Party Invitation Set",
    price: 7.99,
    description: "Modern birthday invitation, party banner, and checklist. Black, white, and cyan design.",
    category: "Invitations",
  },
  // ── Kids ──────────────────────────────────────────────────────────────────
  {
    id: "kids-activity",
    name: "Kids Activity Sheets Pack",
    price: 6.99,
    description: "30 educational activity sheets — alphabet tracing, counting, coloring, and puzzles.",
    category: "Kids",
  },
];

// ── Bundles ───────────────────────────────────────────────────────────────────
export const BUNDLE_CATALOG: ProductCatalogItem[] = [
  {
    id: "planner-bundle",
    name: "Ultimate Planner Bundle",
    price: 39.99,
    salePrice: 27.99,
    description: "All 6 planner products in one bundle. Save 30% vs buying individually.",
    category: "Bundles",
    isBundle: true,
    bundleProductIds: ["weekly-planner", "budget-planner", "habit-tracker", "goal-workbook", "meal-planner", "journal-bundle"],
  },
  {
    id: "template-bundle",
    name: "Creator Template Bundle",
    price: 79.99,
    salePrice: 55.99,
    description: "All 6 template products — resume, social, Notion, brand kit & more. Save 30%.",
    category: "Bundles",
    isBundle: true,
    bundleProductIds: ["resume-bundle", "social-calendar", "social-templates", "notion-template", "brand-kit", "business-card"],
  },
  {
    id: "wall-art-bundle",
    name: "Wall Art Collection Bundle",
    price: 14.99,
    salePrice: 9.99,
    description: "Both wall art sets — geometric and typography quotes. Save 33%.",
    category: "Bundles",
    isBundle: true,
    bundleProductIds: ["wall-art-geometric", "wall-art-quotes"],
  },
  {
    id: "starter-bundle",
    name: "Print Static Starter Pack",
    price: 34.99,
    salePrice: 24.99,
    description: "Best-sellers bundle: Weekly Planner, Resume Bundle, Wall Art Geometric & Instagram Templates. Save 28%.",
    category: "Bundles",
    isBundle: true,
    bundleProductIds: ["weekly-planner", "resume-bundle", "wall-art-geometric", "social-templates"],
  },
];

export const ALL_PRODUCTS = [...PRODUCT_CATALOG, ...BUNDLE_CATALOG];

export function getProductById(id: string): ProductCatalogItem | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}
