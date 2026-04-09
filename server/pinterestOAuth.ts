/**
 * Pinterest OAuth callback route
 * Registered at /api/pinterest/callback
 * Exchanges the authorization code for an access token and saves it.
 */
import type { Express, Request, Response } from "express";
import {
  exchangePinterestCode,
  savePinterestToken,
  getPinterestUserInfo,
} from "./pinterest";
import { sdk } from "./_core/sdk";

export function registerPinterestOAuthRoutes(app: Express) {
  /**
   * GET /api/pinterest/callback
   * Pinterest redirects here after the user authorizes the app.
   * Query params: code, state, error (if denied)
   */
  app.get("/api/pinterest/callback", async (req: Request, res: Response) => {
    const { code, state, error } = req.query as Record<string, string>;

    // Decode state to get the origin
    let origin = "";
    try {
      const decoded = JSON.parse(Buffer.from(state ?? "", "base64url").toString());
      origin = decoded.origin ?? "";
    } catch {
      origin = "";
    }

    const redirectBase = origin || "http://localhost:3000";

    if (error) {
      console.error("[Pinterest OAuth] User denied access:", error);
      return res.redirect(`${redirectBase}/agent?pinterest=denied`);
    }

    if (!code) {
      return res.redirect(`${redirectBase}/agent?pinterest=error&msg=no_code`);
    }

    // Identify the logged-in user from their session cookie
    let userId: number | null = null;
    try {
      const user = await sdk.authenticateRequest(req as any);
      if (user) userId = user.id;
    } catch (e) {
      console.error("[Pinterest OAuth] Failed to identify user:", e);
    }

    if (!userId) {
      return res.redirect(`${redirectBase}/agent?pinterest=error&msg=not_logged_in`);
    }

    try {
      const redirectUri = `${redirectBase}/api/pinterest/callback`;
      const tokenData = await exchangePinterestCode(code, redirectUri);

      // Fetch Pinterest user info
      let pinterestUserId: string | undefined;
      let pinterestUsername: string | undefined;
      try {
        const userInfo = await getPinterestUserInfo(tokenData.access_token);
        pinterestUserId = userInfo.id;
        pinterestUsername = userInfo.username;
      } catch {
        // Non-fatal — we can still store the token
      }

      await savePinterestToken(userId, {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        scope: tokenData.scope,
        expiresIn: tokenData.expires_in,
        pinterestUserId,
        pinterestUsername,
      });

      console.log(`[Pinterest OAuth] Connected for user ${userId} (@${pinterestUsername})`);
      return res.redirect(
        `${redirectBase}/agent?pinterest=connected&username=${encodeURIComponent(pinterestUsername ?? "")}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "unknown";
      console.error("[Pinterest OAuth] Token exchange failed:", msg);
      return res.redirect(
        `${redirectBase}/agent?pinterest=error&msg=${encodeURIComponent(msg)}`
      );
    }
  });
}
