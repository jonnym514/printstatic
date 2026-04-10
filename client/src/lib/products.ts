/**
 * Client-side product catalog
 * Re-exports and extends shared/products.ts with client-specific data
 * (color variants, style options, images)
 *
 * Server uses shared/products.ts directly for price validation.
 * Client uses this for full product data with styles, colors, images.
 */

import {
  PRODUCT_CATALOG,
  BUNDLE_CATALOG,
  type ProductCatalogItem,
  type ColorVariant,
} from "../../../shared/products";

// ── Style Variant Type ─────────────────────────────────────────────────────────

export type StyleVariant = {
  id: string;
  label: string;
};

export { type ColorVariant } from "../../../shared/products";

// ── Extended Product Type ──────────────────────────────────────────────────────

export interface Product extends ProductCatalogItem {
  colorVariants?: ColorVariant[];
  styleVariants?: StyleVariant[];
  styleImages?: Record<string, string>;
  image: string;
}

// ── Style Filters ──────────────────────────────────────────────────────────────

export const styleFilters: StyleVariant[] = [
  { id: "All", label: "All Styles" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "creative", label: "Creative" },
];

// ── Extend products with client data ───────────────────────────────────────────

const extendedProducts = [...PRODUCT_CATALOG, ...BUNDLE_CATALOG].map(
  (item): Product => ({
    ...item,
    // Main image path
    image: `/api/placeholder/${item.name}/${item.category}`,
    // Color variants (if applicable)
    colorVariants: item.variants,
    // Style variants for template/design products
    styleVariants: ["resume-bundle", "social-templates", "business-card", "brand-kit", "wedding-invite"].includes(item.id)
      ? styleFilters.filter((s) => s.id !== "All")
      : undefined,
    // Style-specific images for template/design products
    styleImages: ["resume-bundle", "social-templates", "business-card", "brand-kit", "wedding-invite"].includes(
      item.id
    )
      ? {
          minimal: `/api/placeholder/${item.name}/minimal`,
          bold: `/api/placeholder/${item.name}/bold`,
          creative: `/api/placeholder/${item.name}/creative`,
        }
      : undefined,
  })
);

export const products: Product[] = extendedProducts;

// ── Categories ─────────────────────────────────────────────────────────────────

export const categories: string[] = [
  "All",
  "Planners",
  "Templates",
  "Wall Art",
  "Invitations",
  "Kids",
  "Bundles",
];

// ── Filter Functions ──────────────────────────────────────────────────────────

/**
 * Filter products by category
 * @param category - Category name. "All" returns all products.
 */
export function getProductsByCategory(category: string): Product[] {
  if (category === "All") {
    return products;
  }
  return products.filter((p) => p.category === category);
}

/**
 * Filter products by style variant
 * @param products - Array of products to filter
 * @param style - Style ID. "All" returns all products.
 */
export function getProductsByStyle(products: Product[], style: string): Product[] {
  if (style === "All") {
    return products;
  }
  return products.filter((p) => p.styleVariants?.some((sv) => sv.id === style));
}

/**
 * Get a product by ID
 */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Get the image URL for a product, optionally with color or style
 * @param product - The product
 * @param colorId - Optional color variant ID
 * @param styleId - Optional style variant ID
 */
export function getProductImage(
  product: Product,
  colorId?: string,
  styleId?: string
): string {
  // If style is specified and we have style-specific images, use those
  if (styleId && product.styleImages?.[styleId]) {
    return product.styleImages[styleId];
  }
  // Otherwise use the main image
  return product.image;
}
