import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerPinterestOAuthRoutes } from "./pinterestOAuth";
import { registerStripeWebhook } from "./stripeWebhook";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { serveStatic, setupVite } from "./vite";
import { startScheduler } from "./scheduler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Generate an SVG placeholder image for a product.
 * Returns a branded placeholder with the product name and category.
 */
function generatePlaceholderSVG(name: string, category: string): string {
  // Category-based accent colors
  const categoryColors: Record<string, string> = {
    planners: "#00c4a7",
    templates: "#6366f1",
    "wall art": "#f59e0b",
    invitations: "#ec4899",
    kids: "#10b981",
    bundles: "#8b5cf6",
  };
  const accent = categoryColors[category.toLowerCase()] || "#00c4a7";

  // Category icons (simple SVG paths)
  const categoryIcons: Record<string, string> = {
    planners: '<rect x="85" y="160" width="80" height="100" rx="4" fill="none" stroke="' + accent + '" stroke-width="2"/><line x1="95" y1="180" x2="155" y2="180" stroke="' + accent + '" stroke-width="1.5"/><line x1="95" y1="195" x2="145" y2="195" stroke="' + accent + '" stroke-width="1.5" opacity="0.5"/><line x1="95" y1="210" x2="150" y2="210" stroke="' + accent + '" stroke-width="1.5" opacity="0.5"/><line x1="95" y1="225" x2="140" y2="225" stroke="' + accent + '" stroke-width="1.5" opacity="0.3"/>',
    templates: '<rect x="85" y="160" width="80" height="100" rx="4" fill="none" stroke="' + accent + '" stroke-width="2"/><rect x="92" y="168" width="30" height="20" rx="2" fill="' + accent + '" opacity="0.2"/><line x1="92" y1="198" x2="158" y2="198" stroke="' + accent + '" stroke-width="1.5" opacity="0.5"/><line x1="92" y1="213" x2="148" y2="213" stroke="' + accent + '" stroke-width="1.5" opacity="0.3"/>',
    "wall art": '<rect x="90" y="165" width="70" height="90" rx="2" fill="none" stroke="' + accent + '" stroke-width="2"/><circle cx="110" cy="195" r="10" fill="' + accent + '" opacity="0.2"/><polygon points="95,240 115,210 130,225 150,200 155,240" fill="' + accent + '" opacity="0.15"/>',
    invitations: '<rect x="80" y="160" width="90" height="110" rx="6" fill="none" stroke="' + accent + '" stroke-width="2"/><path d="M80,185 L125,210 L170,185" fill="none" stroke="' + accent + '" stroke-width="1.5" opacity="0.5"/>',
    kids: '<circle cx="125" cy="200" r="35" fill="none" stroke="' + accent + '" stroke-width="2"/><circle cx="115" cy="192" r="4" fill="' + accent + '"/><circle cx="135" cy="192" r="4" fill="' + accent + '"/><path d="M112,210 Q125,222 138,210" fill="none" stroke="' + accent + '" stroke-width="2"/>',
    bundles: '<rect x="78" y="165" width="70" height="85" rx="4" fill="none" stroke="' + accent + '" stroke-width="2" opacity="0.4"/><rect x="85" y="158" width="70" height="85" rx="4" fill="none" stroke="' + accent + '" stroke-width="2" opacity="0.7"/><rect x="92" y="151" width="70" height="85" rx="4" fill="none" stroke="' + accent + '" stroke-width="2"/>',
  };
  const icon = categoryIcons[category.toLowerCase()] || categoryIcons.templates;

  // Wrap long names
  const maxChars = 22;
  const words = name.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);

  const nameY = 300;
  const nameElements = lines
    .map((line, i) => `<text x="125" y="${nameY + i * 22}" text-anchor="middle" font-family="'Space Grotesk', Arial, sans-serif" font-size="15" font-weight="700" fill="#1a1a1a">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="380" viewBox="0 0 250 380">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fafafa"/>
      <stop offset="100%" stop-color="#f0f0f0"/>
    </linearGradient>
  </defs>
  <rect width="250" height="380" fill="url(#bg)"/>
  <rect x="0.5" y="0.5" width="249" height="379" rx="6" fill="none" stroke="#e0e0e0" stroke-width="1"/>
  <!-- Top accent bar -->
  <rect width="250" height="4" fill="${accent}"/>
  <!-- Category icon area -->
  ${icon}
  <!-- Product name -->
  ${nameElements}
  <!-- Category label -->
  <text x="125" y="${nameY + lines.length * 22 + 12}" text-anchor="middle" font-family="'Space Mono', monospace" font-size="10" fill="#999" text-transform="uppercase" letter-spacing="2">/${category.toLowerCase().replace(/\s+/g, "_")}</text>
  <!-- Bottom bar -->
  <rect y="358" width="250" height="22" fill="#0d0d0d"/>
  <text x="125" y="373" text-anchor="middle" font-family="'Space Mono', monospace" font-size="9" fill="#00c4a7">PRINT_STATIC</text>
</svg>`;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Stripe webhook MUST be registered before body parsers to preserve raw body
  registerStripeWebhook(app);

  // Cookie parser (needed for session auth)
  app.use(cookieParser());

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── Placeholder image endpoint ──────────────────────────────────────────
  // Generates branded SVG placeholder images for products
  app.get("/api/placeholder/:name/:category", (req, res) => {
    const name = decodeURIComponent(req.params.name);
    const category = decodeURIComponent(req.params.category);
    const svg = generatePlaceholderSVG(name, category);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(svg);
  });

  // OAuth routes
  registerOAuthRoutes(app);
  registerPinterestOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Dev vs production serving
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
    startScheduler();
  });
}

startServer().catch(console.error);
