/**
 * Cookie configuration helper.
 * Returns options suitable for the session cookie based on the request.
 */

import type { Request } from "express";
import type { CookieOptions } from "express";

export function getSessionCookieOptions(req: Request): CookieOptions {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}
