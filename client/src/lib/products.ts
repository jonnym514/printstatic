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

// ── Style Variant Type ─────────────────────────────────────────────────────────────

export type StyleVariant = {
  id: string;
  label: string;
};

export { type ColorVariant } from "../../../shared/products";

// ── Extended Product Type ──────────────────────────────────────────────────────────

export interface Product extends ProductCatalogItem {
  colorVariants?: ColorVariant[];
  styleVariants?: StyleVariant[];
  styleImages?: Record<string, string>;
  image: string;
}

// ── Style Filters ────────────────────────────────────────────────────────────────

export const styleFilters: StyleVariant[] = [
  { id: "All", label: "All Styles" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "creative", label: "Creative" },
];

// ── Extend products with client data ─────────────────────────────────────────────────

const extendedProducts = [...PRODUCT_CATALOG, ...BUNDLE_CATALOG].map(
  (item): Product => ({
    ...item,
    // Main image path — uses generated SVG placeholders
    image: `/api/placeholder/${encodeURIComponent(item.name)}/${encodeURIComponent(item.category)}`,
    // Color variants (if applicable)
    colorVariants: item.variants,
    // Style variants for some products
    styleVariants: ["minimal", "bold", "creative"].includes(item.id)
      ? styleFilters.filter((s) => s.id !== "All")
      : undefined,
    // Style-specific images for template/design products
    styleImages: ["resume-bundle", "social-templates", "business-card"].includes(
      item.id
    )
      ? {
          minimal: `/api/placeholder/${encodeURIComponent(item.name + " \u2014 Minimal")}/${encodeURIComponent(item.category)}`,
          bold: `/api/placeholder/${encodeURIComponent(item.name + " \u2014 Bold")}/${encodeURIComponent(item.category)}`,
          creative: `/api/placeholder/${encodeURIComponent(item.name + " \u2014 Creative")}/${encodeURIComponent(item.category)}`,
        }
      : undefined,
  })
);

export const products: Product[] = extendedProducts;

// ── Categories ───────────────────────────────────────────────────────────────────

export const categories: { id: string; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Planners", label: "Planners" },
  { id: "Templates", label: "Templates" },
  { id: "Wall Art", label: "Wall Art" },
  { id: "Invitations", label: "Invitations" },
  { id: "Kids", label: "Kids" },
  { id: "Bundles", label: "Bundles" },
];

// ── Filter Functions ──────────────────────────────────────────────────────────────

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

// ── Style Variant Type ─────────────────────────────────────────────────────────────

export type StyleVariant = {
  id: string;
  label: string;
};

export { type ColorVariant } from "../../../shared/products";

// ── Extended Product Type ──────────────────────────────────────────────────────────

export interface Product extends ProductCatalogItem {
  colorVariants?: ColorVariant[];
  styleVariants?: StyleVariant[];
  styleImages?: Record<string, string>;
  image: string;
}

// ── Style Filters ────────────────────────────────────────────────────────────────

export const styleFilters: StyleVariant[] = [
  { id: "All", label: "All Styles" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "creative", label: "Creative" },
];

// ── Extend products with client data ─────────────────────────────────────────────────

const extendedProducts = [...PRODUCT_CATALOG, ...BUNDLE_CATALOG].map(
  (item): Product => ({
    ...item,
    // Main image path — uses generated SVG placeholders
    image: `/api/placeholder/${encodeURIComponent(item.name)}/${encodeURIComponent(item.category)}`,
    // Color variants (if applicable)
    colorVariants: item.variants,
    // Style variants for some products
    styleVariants: ["minimal", "bold", "creative"].includes(item.id)
      ? styleFilters.filter((s) => s.id !== "All")
      : undefined,
    // Style-specific images for template/design products
    styleImages: ["resume-bundle", "social-templates", "business-card"].includes(
      item.id
    )
      ? {
          minimal: `/api/placeholder/${encodeURIComponent(item.name + " \u2014 Minimal")}/${encodeURIComponent(item.category)}`,
          bold: `/api/placeholder/${encodeURIComponent(item.name + " \u2014 Bold")}/${encodeURIComponent(item.category)}`,
          creative: `/api/placeholder/${encodeURIComponent(item.name + " \u2014 Creative")}/${encodeURIComponent(item.category)}`,
        }
      : undefined,
  })
);

export const products: Product[] = extendedProducts;

// ── Categories ───────────────────────────────────────────────────────────────────

export const categories: { id: string; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Planners", label: "Planners" },
  { id: "Templates", label: "Templates" },
  { id: "Wall Art", label: "Wall Art" },
  { id: "Invitations", label: "Invitations" },
  { id: "Kids", label: "Kids" },
  { id: "Bundles", label: "Bundles" },
];

// ── Filter Functions ──────────────────────────────────────────────────────────────

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

// -- Style Variant Type -------------------------------------------------------

export type StyleVariant = {
  id: string;
  label: string;
};

export { type ColorVariant } from "../../../shared/products";

// -- Extended Product Type ----------------------------------------------------

export interface Product extends ProductCatalogItem {
  colorVariants?: ColorVariant[];
  styleVariants?: StyleVariant[];
  styleImages?: Record<string, string>;
  image: string;
  badge?: string;
  longDescription: string;
  fileFormat: string;
  pages: number;
  rating: number;
  downloads: number;
  tags: string[];
}

// -- Style Filters ------------------------------------------------------------

export const styleFilters: StyleVariant[] = [
  { id: "All", label: "All Styles" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "creative", label: "Creative" },
];

// -- Extend products with client data -------------------------------------------

const extendedProducts = [...PRODUCT_CATALOG, ...BUNDLE_CATALOG].map(
  (item): Product => ({
    ...item,
    image: `/attached_assets/products/${item.id}.jpg`,
    badge: item.flashSale ? "Flash Sale" : undefined,
    longDescription: item.description,
    fileFormat: "PDF",
    pages: 1,
    rating: 4.8,
    downloads: 1200,
    tags: [item.category.toLowerCase()],
    colorVariants: item.variants,
    styleVariants: ["minimal", "bold", "creative"].includes(item.id)
      ? styleFilters.filter((s) => s.id !== "All")
      : undefined,
    styleImages: ["resume-bundle", "social-templates", "business-card"].includes(
      item.id
    )
      ? {
          minimal: `/attached_assets/products/${item.id}-minimal.jpg`,
          bold: `/attached_assets/products/${item.id}-bold.jpg`,
          creative: `/attached_assets/products/${item.id}-creative.jpg`,
        }
      : undefined,
  })
);

export const products: Product[] = extendedProducts;

// -- Categories ---------------------------------------------------------------

export const categories: { id: string; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Planners", label: "Planners" },
  { id: "Templates", label: "Templates" },
  { id: "Wall Art", label: "Wall Art" },
  { id: "Invitations", label: "Invitations" },
  { id: "Kids", label: "Kids" },
  { id: "Bundles", label: "Bundles" },
];

// -- Filter Functions ---------------------------------------------------------

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") {
    return products;
  }
  return products.filter((p) => p.category === category);
}

export function getProductsByStyle(products: Product[], style: string): Product[] {
  if (style === "All") {
    return products;
  }
  return products.filter((p) => p.styleVariants?.some((sv) => sv.id === style));
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductImage(
  product: Product,
  colorId?: string,
  styleId?: string
): string {
  if (styleId && product.styleImages?.[styleId]) {
    return product.styleImages[styleId];
  }
  return product.image;
}
