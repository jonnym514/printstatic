/**
 * Vite integration for the Express server.
 *
 * Development: creates a Vite dev server as middleware (HMR, fast refresh).
 * Production: serves the pre-built static files from client/dist.
 */

import type { Express } from "express";
import type { Server } from "http";
import path from "path";
import express from "express";

export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer } = await import("vite");

  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: "spa",
  });

  app.use(vite.middlewares);

  // Fallback to index.html for SPA routing
  app.use("*", async (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) return next();

    try {
      const url = req.originalUrl;
      let template = await vite.transformIndexHtml(
        url,
        await import("fs").then((fs) =>
          fs.promises.readFile(path.resolve("index.html"), "utf-8")
        )
      );
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve("client/dist");

  app.use(express.static(distPath));

  // SPA fallback — serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
    res.sendFile(path.join(distPath, "index.html"));
  });
}
