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
    image: `/attached_assets/products/${item.id}.jpg`,
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

export function getProductsByCategory(category: string): Product[] {
  if (category === "All") {
    return products;
  }
  return products.filter((p) => p.category === category);
}

export function getProductsByStyle(productList: Product[], style: string): Product[] {
  if (style === "All") {
    return productList;
  }
  return productList.filter((p) => p.styleVariants?.some((sv) => sv.id === style));
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
