# Architecture Reference

## Product Type (client/src/lib/products.ts)

```ts
export interface ColorVariant {
  name: string;   // e.g. "Neutral"
  hex: string;    // e.g. "#E8E4DC"
  label: string;  // e.g. "Warm Neutral"
}

export interface StyleVariant {
  name: string;        // e.g. "Minimalist"
  description: string; // e.g. "Clean lines, plenty of white space"
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;           // CDN URL only
  badge?: string;          // e.g. "BESTSELLER"
  description: string;
  longDescription: string;
  fileFormat: string;      // e.g. "PDF"
  pages: number;
  rating: number;
  downloads: number;
  tags: string[];
  colorVariants: ColorVariant[];
  styleVariants: StyleVariant[];
  bundleIds?: string[];    // IDs of products in this bundle
}
```

## Drizzle Schema (drizzle/schema.ts)

```ts
// Core tables (already in template)
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  openId: varchar('open_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  avatar: varchar('avatar', { length: 500 }),
  role: mysqlEnum('role', ['admin', 'user']).default('user').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Product files (S3 references)
export const productFiles = mysqlTable('product_files', {
  id: int('id').autoincrement().primaryKey(),
  productId: varchar('product_id', { length: 100 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileKey: varchar('file_key', { length: 500 }).notNull(),
  fileUrl: varchar('file_url', { length: 1000 }).notNull(),
  fileSize: int('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  uploadedAt: bigint('uploaded_at', { mode: 'number' }).notNull(),
});

// Orders (created by Stripe webhook)
export const orders = mysqlTable('orders', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }).notNull().unique(),
  productIds: text('product_ids').notNull(), // JSON array of product IDs
  totalAmount: int('total_amount').notNull(), // cents
  status: mysqlEnum('status', ['pending', 'completed', 'refunded']).default('pending').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Reviews
export const reviews = mysqlTable('reviews', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  productId: varchar('product_id', { length: 100 }).notNull(),
  rating: int('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Wishlist
export const wishlistItems = mysqlTable('wishlist_items', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  productId: varchar('product_id', { length: 100 }).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Flash sales
export const flashSales = mysqlTable('flash_sales', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  discountPercent: int('discount_percent').notNull(),
  productIds: text('product_ids'), // NULL = site-wide
  startTime: bigint('start_time', { mode: 'number' }).notNull(),
  endTime: bigint('end_time', { mode: 'number' }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Blog posts (AI-generated)
export const blogPosts = mysqlTable('blog_posts', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  content: longtext('content').notNull(),
  keyword: varchar('keyword', { length: 255 }),
  status: mysqlEnum('status', ['draft', 'published']).default('draft').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});

// Email subscribers
export const emailSubscribers = mysqlTable('email_subscribers', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  subscribedAt: bigint('subscribed_at', { mode: 'number' }).notNull(),
});

// Agent logs
export const agentLogs = mysqlTable('agent_logs', {
  id: int('id').autoincrement().primaryKey(),
  action: varchar('action', { length: 100 }).notNull(),
  platform: varchar('platform', { length: 50 }),
  content: longtext('content'),
  status: mysqlEnum('status', ['success', 'error']).default('success').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
});
```

## File Structure

```
client/src/
  lib/products.ts          ← Full product catalog with variants
  contexts/CartContext.tsx  ← Cart state with localStorage persistence
  pages/
    Home.tsx               ← Landing page
    Shop.tsx               ← Product grid
    ProductDetail.tsx      ← Product page with all selectors
    Bundles.tsx            ← Bundle packs
    Cart.tsx               ← Cart with pack qty display
    Orders.tsx             ← Order history with download links
    OrderSuccess.tsx       ← Post-purchase download links
    AdminFiles.tsx         ← Admin PDF upload panel
    AgentDashboard.tsx     ← AI marketing agent
  components/
    Navbar.tsx             ← Logo image (not text), cart icon
    Footer.tsx             ← Logo image, links
    ProductCard.tsx        ← Card with wishlist heart, color swatches

server/routers/
  stripe.ts                ← Checkout + webhook
  files.ts                 ← Upload + download + delete
  reviews.ts               ← CRUD reviews
  wishlist.ts              ← Add/remove/get wishlist
  flashSales.ts            ← Active sale + admin controls
  agent.ts                 ← LLM content generation

drizzle/schema.ts          ← All tables above
```
