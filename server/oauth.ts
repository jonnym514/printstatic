/**
 * Google OAuth2 callback handler.
 *
 * Flow:
 *   1. Client opens /api/auth/google → redirects to Google consent screen
 *   2. Google redirects back to /api/oauth/callback?code=...&state=...
 *   3. We exchange the code for tokens, fetch the user profile,
 *      upsert into our DB, sign a JWT, set a cookie, redirect home.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */

import type { Express } from "express";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { upsertUser } from "./db";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function getGoogleCreds() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }
  return { clientId, clientSecret };
}

function getRedirectUri(req: any): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}/api/oauth/callback`;
}

export function registerOAuthRoutes(app: Express) {
  // Step 1 — initiate Google OAuth
  app.get("/api/auth/google", (req, res) => {
    const { clientId } = getGoogleCreds();
    const redirectUri = getRedirectUri(req);
    const state = Buffer.from(JSON.stringify({ returnTo: "/" })).toString("base64url");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  });

  // Step 2 — handle the callback
  app.get("/api/oauth/callback", async (req, res) => {
    const code = req.query.code as string | undefined;
    if (!code) {
      return res.status(400).send("Missing authorization code");
    }

    try {
      const { clientId, clientSecret } = getGoogleCreds();
      const redirectUri = getRedirectUri(req);

      // Exchange code for tokens
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        console.error("[OAuth] Token exchange failed:", err);
        return res.status(500).send("Authentication failed");
      }

      const { access_token } = (await tokenRes.json()) as { access_token: string };

      // Fetch user profile
      const profileRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!profileRes.ok) {
        return res.status(500).send("Failed to fetch user profile");
      }

      const profile = (await profileRes.json()) as {
        sub: string;
        name?: string;
        email?: string;
      };

      // Upsert into our database
      await upsertUser({
        openId: `google_${profile.sub}`,
        name: profile.name ?? null,
        email: profile.email ?? null,
        loginMethod: "google",
      });

      // Sign JWT and set cookie
      const token = sdk.signToken(`google_${profile.sub}`);
      const cookieOpts = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, cookieOpts);

      // Redirect back
      let returnTo = "/";
      try {
        const stateStr = Buffer.from((req.query.state as string) || "", "base64url").toString();
        const parsed = JSON.parse(stateStr);
        if (parsed.returnTo) returnTo = parsed.returnTo;
      } catch {}

      res.redirect(returnTo);
    } catch (err) {
      console.error("[OAuth] Callback error:", err);
      res.status(500).send("Authentication error");
    }
  });
}
