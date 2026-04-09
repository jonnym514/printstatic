/**
 * Self-hosted authentication SDK replacement.
 *
 * Replaces the Manus auth SDK with JWT-based session auth.
 * The `/api/oauth/callback` route sets a signed JWT in a cookie.
 * This module reads that cookie and resolves the current user.
 */

import type { Request } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "@shared/const";
import { getUserByOpenId } from "../db";
import type { User } from "../../drizzle/schema";
import { ENV } from "../env";

interface JwtPayload {
  sub: string; // openId
  iat: number;
  exp: number;
}

export const sdk = {
  /**
   * Read the session cookie, verify the JWT, and return the User row.
   * Returns null (not throw) when no valid session exists so that
   * public tRPC procedures still work for anonymous visitors.
   */
  async authenticateRequest(req: Request): Promise<User | null> {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return null;

    try {
      const secret = ENV.cookieSecret;
      if (!secret) throw new Error("JWT_SECRET not configured");

      const payload = jwt.verify(token, secret) as JwtPayload;
      const user = await getUserByOpenId(payload.sub);
      return user ?? null;
    } catch {
      // Expired / malformed token → treat as anonymous
      return null;
    }
  },

  /**
   * Create a signed JWT for the given openId.
   * Called from the OAuth callback after upserting the user.
   */
  signToken(openId: string): string {
    const secret = ENV.cookieSecret;
    if (!secret) throw new Error("JWT_SECRET not configured");
    return jwt.sign({ sub: openId }, secret, { expiresIn: "30d" });
  },
};
