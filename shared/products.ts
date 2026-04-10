/**
 * Shared product catalog â used by both client and server.
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
  /** Sale price â if set, this is the active price */
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
  // ââ Planners ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: "weekly-planner",
    name: "Weekly Planner Bundle",
    price: 7.99,
    description: "7-day layout with time blocks, priorities, and habit tracker. Print-ready PDF.",
    category: "Planners",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "teal", label: "Teal", hex: "#0D9488" },
      { id: "blush", label: "Blush", hex: "#F9A8D4" },
      { id: "charcoal", label: "Charcoal", hex: "#374151" },
    ],
  },
  {
    id: "budget-planner",
    name: "Budget Planner Spreadsheet",
    price: 9.99,
    description: "Monthly budget tracker with income, expenses, savings goals, and debt payoff.",
    category: "Planners",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "sage", label: "Sage", hex: "#6B8F71" },
      { id: "navy", label: "Navy", hex: "#1E3A5F" },
    ],
  },
  {
    id: "habit-tracker",
    name: "Habit Tracker â 30 Day",
    price: 4.99,
    description: "Track up to 20 habits daily. Monthly overview grid with streak counter.",
    category: "Planners",
    variants: [
      { id: "teal", label: "Teal", hex: "#0D9488" },
      { id: "coral", label: "Coral", hex: "#F87171" },
      { id: "indigo", label: "Indigo", hex: "#6366F1" },
      { id: "charcoal", label: "Charcoal", hex: "#374151" },
    ],
  },
  {
    id: "goal-workbook",
    name: "Goal Setting Workbook",
    price: 12.99,
    description: "Annual goal-setting system with vision board prompts, quarterly milestones, and weekly check-ins.",
    category: "Planners",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "gold", label: "Gold", hex: "#D4A843" },
      { id: "teal", label: "Teal", hex: "#0D9488" },
    ],
  },
  {
    id: "meal-planner",
    name: "Meal Planner + Grocery List",
    price: 5.99,
    description: "Weekly meal plan grid with breakfast, lunch, dinner, and a tear-off grocery list.",
    category: "Planners",
    variants: [
      { id: "sage", label: "Sage", hex: "#6B8F71" },
      { id: "blush", label: "Blush", hex: "#F9A8D4" },
      { id: "lemon", label: "Lemon", hex: "#FDE047" },
    ],
  },
  {
    id: "journal-bundle",
    name: "Daily Journal + Gratitude Bundle",
    price: 8.99,
    description: "Morning routine journal, gratitude prompts, and evening reflection pages. 30-day system.",
    category: "Planners",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "lavender", label: "Lavender", hex: "#A78BFA" },
      { id: "blush", label: "Blush", hex: "#F9A8D4" },
      { id: "sage", label: "Sage", hex: "#6B8F71" },
    ],
  },
  // ââ Templates âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: "resume-bundle",
    name: "Resume Template Bundle",
    price: 14.99,
    description: "5 ATS-friendly resume templates in minimal, bold, and creative styles. Canva + Word.",
    category: "Templates",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "navy", label: "Navy", hex: "#1E3A5F" },
      { id: "teal", label: "Teal", hex: "#0D9488" },
    ],
  },
  {
    id: "social-calendar",
    name: "Social Media Content Calendar",
    price: 11.99,
    description: "90-day content calendar with post ideas, caption templates, and hashtag banks.",
    category: "Templates",
    variants: [
      { id: "teal", label: "Teal", hex: "#0D9488" },
      { id: "coral", label: "Coral", hex: "#F87171" },
      { id: "charcoal", label: "Charcoal", hex: "#374151" },
    ],
  },
  {
    id: "social-templates",
    name: "Instagram Post Templates",
    price: 19.99,
    description: "50 Canva Instagram post templates â quotes, carousels, reels covers, and stories.",
    category: "Templates",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "bold-pink", label: "Bold Pink", hex: "#EC4899" },
      { id: "ocean", label: "Ocean", hex: "#0EA5E9" },
      { id: "charcoal", label: "Charcoal", hex: "#374151" },
    ],
  },
  {
    id: "notion-template",
    name: "Notion Productivity Dashboard",
    price: 16.99,
    description: "All-in-one Notion workspace with task manager, habit tracker, reading list, and journal.",
    category: "Templates",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "charcoal", label: "Charcoal", hex: "#374151" },
    ],
  },
  {
    id: "brand-kit",
    name: "Brand Identity Kit",
    price: 24.99,
    description: "Complete brand kit with logo templates, color palette guide, font pairing guide, and brand board.",
    category: "Templates",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "teal", label: "Teal", hex: "#0D9488" },
      { id: "navy", label: "Navy", hex: "#1E3A5F" },
      { id: "gold", label: "Gold", hex: "#D4A843" },
    ],
  },
  {
    id: "business-card",
    name: "Business Card Template Pack",
    price: 6.99,
    description: "4 professional business card designs â minimal, bold, creative, and classic. Print-ready.",
    category: "Templates",
    variants: [
      { id: "neutral", label: "Neutral", hex: "#C4B5A0" },
      { id: "navy", label: "Navy", hex: "#1E3A5F" },
      { id: "charcoal", label: "Charcoal", hex: "#374151" },
      { id: "teal", label: "Teal", hex: "#0D9488" },
    ],
  },
  // ââ Wall Art ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: "wall-art-geometric",
    name: "Geometric Wall Art Set",
    price: 5.99,
    description: "6 minimalist geometric prints in black, white, and gold. Print at any size.",
    category: "Wall Art",
    variants: [
      { id: "mono", label: "Monochrome", hex: "#1F2937" },
      { id: "gold", label: "Gold Accent", hex: "#D4A843" },
      { id: "teal", label: "Teal Accent", hex: "#0D9488" },
      { id: "blush", label: "Blush Accent", hex: "#F9A8D4" },
    ],
  },
  {
    id: "wall-art-quotes",
    name: "Typography Quote Prints",
    price: 4.99,
    description: "8 motivational quote prints with bold typographic layouts. Gallery wall ready.",
    category: "Wall Art",
    variants: [
      { id: "mono", label: "Monochrome", hex: "#1F2937" },
      { id: "warm", label: "Warm Tones", hex: "#D97706" },
      { id: "cool", label: "Cool Tones", hex: "#2563EB" },
    ],
  },
  // ââ Invitations âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: "wedding-invite",
    name: "Wedding Invitation Suite",
    price: 18.99,
    description: "Elegant wedding invitation, RSVP card, and envelope liner. Fully editable in Canva.",
    category: "Invitations",
    variants: [
      { id: "classic", label: "Classic White", hex: "#F5F0EB" },
      { id: "sage", label: "Sage Green", hex: "#6B8F71" },
      { id: "dusty-rose", label: "Dusty Rose", hex: "#C9A0A0" },
      { id: "navy", label: "Navy & Gold", hex: "#1E3A5F" },
    ],
  },
  {
    id: "party-invite",
    name: "Birthday Party Invitation Set",
    price: 7.99,
    description: "Modern birthday invitation, party banner, and checklist. Black, white, and cyan design.",
    category: "Invitations",
    variants: [
      { id: "teal", label: "Teal Pop", hex: "#0D9488" },
      { id: "coral", label: "Coral Party", hex: "#F87171" },
      { id: "purple", label: "Purple Haze", hex: "#8B5CF6" },
      { id: "gold", label: "Gold Glam", hex: "#D4A843" },
    ],
  },
  // ââ Kids ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    id: "kids-activity",
    name: "Kids Activity Sheets Pack",
    price: 6.99,
    description: "30 educational activity sheets â alphabet tracing, counting, coloring, and puzzles.",
    category: "Kids",
    variants: [
      { id: "rainbow", label: "Rainbow", hex: "#F472B6" },
      { id: "primary", label: "Primary Colors", hex: "#3B82F6" },
      { id: "pastel", label: "Pastel", hex: "#C4B5D4" },
    ],
  },
];

// ââ Bundles âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    description: "All 6 template products â resume, social, Notion, brand kit & more. Save 30%.",
    category: "Bundles",
    isBundle: true,
    bundleProductIds: ["resume-bundle", "social-calendar", "social-templates", "notion-template", "brand-kit", "business-card"],
  },
  {
    id: "wall-art-bundle",
    name: "Wall Art Collection Bundle",
    price: 14.99,
    salePrice: 9.99,
    description: "Both wall art sets â geometric and typography quotes. Save 33%.",
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
