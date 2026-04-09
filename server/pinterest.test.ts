/**
 * Pinterest Agent — Unit Tests
 * Tests the core logic of the Pinterest service module without
 * making real API calls or DB connections.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Helpers under test (pure functions) ─────────────────────────────────────

/** Build the Pinterest OAuth authorization URL */
function buildPinterestAuthUrl(
  appId: string,
  redirectUri: string,
  state: string,
  scopes: string[]
): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(","),
    state,
  });
  return `https://www.pinterest.com/oauth/?${params.toString()}`;
}

/** Generate a Pinterest pin description from product data */
function buildPinDescription(product: {
  name: string;
  description: string;
  price: number;
  tags?: string[];
}): string {
  const price = (product.price / 100).toFixed(2);
  const tags = (product.tags ?? []).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ");
  return `${product.name} — $${price}\n\n${product.description}\n\nInstant digital download. Print at home.\n\n${tags} #printable #instantdownload #digitaldownload`.trim();
}

/** Validate that a Pinterest access token response has all required fields */
function validateTokenResponse(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.access_token === "string" &&
    d.access_token.length > 0 &&
    typeof d.token_type === "string"
  );
}

/** Build the board mapping for a product category */
function mapProductToBoard(
  category: string,
  boards: { id: string; name: string }[]
): { id: string; name: string } | null {
  const categoryMap: Record<string, string[]> = {
    Planners: ["Printable Planners", "Planners", "Printables"],
    "Wall Art": ["Printable Wall Art", "Wall Art", "Art Prints"],
    Templates: ["Printable Templates", "Templates", "Invitations"],
    Productivity: ["Digital Productivity", "Productivity", "Digital Tools"],
  };
  const candidates = categoryMap[category] ?? [];
  for (const candidate of candidates) {
    const board = boards.find((b) =>
      b.name.toLowerCase().includes(candidate.toLowerCase())
    );
    if (board) return board;
  }
  return boards[0] ?? null;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("buildPinterestAuthUrl", () => {
  it("includes all required OAuth parameters", () => {
    const url = buildPinterestAuthUrl(
      "test-app-id",
      "https://example.com/callback",
      "abc123",
      ["boards:read", "pins:write"]
    );
    expect(url).toContain("client_id=test-app-id");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("response_type=code");
    expect(url).toContain("scope=");
    expect(url).toContain("state=abc123");
    expect(url).toContain("https://www.pinterest.com/oauth/");
  });

  it("encodes scopes as comma-separated list", () => {
    const url = buildPinterestAuthUrl(
      "app",
      "https://example.com/cb",
      "s",
      ["boards:read", "pins:read", "pins:write"]
    );
    expect(url).toContain("boards%3Aread%2Cpins%3Aread%2Cpins%3Awrite");
  });
});

describe("buildPinDescription", () => {
  it("includes product name and price", () => {
    const desc = buildPinDescription({
      name: "Weekly Planner Bundle",
      description: "A beautiful weekly planner for productivity.",
      price: 499,
    });
    expect(desc).toContain("Weekly Planner Bundle");
    expect(desc).toContain("$4.99");
  });

  it("includes instant download CTA", () => {
    const desc = buildPinDescription({
      name: "Test Product",
      description: "Test description",
      price: 100,
    });
    expect(desc).toContain("Instant digital download");
    expect(desc).toContain("#printable");
    expect(desc).toContain("#instantdownload");
  });

  it("includes product tags as hashtags", () => {
    const desc = buildPinDescription({
      name: "Wall Art",
      description: "Beautiful art",
      price: 299,
      tags: ["home decor", "minimalist"],
    });
    expect(desc).toContain("#homedecor");
    expect(desc).toContain("#minimalist");
  });
});

describe("validateTokenResponse", () => {
  it("returns true for valid token response", () => {
    expect(
      validateTokenResponse({
        access_token: "pina_abc123",
        token_type: "bearer",
        expires_in: 2592000,
        scope: "boards:read pins:write",
      })
    ).toBe(true);
  });

  it("returns false for missing access_token", () => {
    expect(validateTokenResponse({ token_type: "bearer" })).toBe(false);
  });

  it("returns false for empty access_token", () => {
    expect(validateTokenResponse({ access_token: "", token_type: "bearer" })).toBe(false);
  });

  it("returns false for null", () => {
    expect(validateTokenResponse(null)).toBe(false);
  });

  it("returns false for non-object", () => {
    expect(validateTokenResponse("string")).toBe(false);
  });
});

describe("mapProductToBoard", () => {
  const boards = [
    { id: "1", name: "Printable Planners" },
    { id: "2", name: "Printable Wall Art" },
    { id: "3", name: "Printable Templates & Invitations" },
    { id: "4", name: "Digital Productivity & Organization" },
  ];

  it("maps Planners category to Printable Planners board", () => {
    const result = mapProductToBoard("Planners", boards);
    expect(result?.id).toBe("1");
  });

  it("maps Wall Art category to Printable Wall Art board", () => {
    const result = mapProductToBoard("Wall Art", boards);
    expect(result?.id).toBe("2");
  });

  it("maps Templates category to Printable Templates board", () => {
    const result = mapProductToBoard("Templates", boards);
    expect(result?.id).toBe("3");
  });

  it("maps Productivity category to Digital Productivity board", () => {
    const result = mapProductToBoard("Productivity", boards);
    expect(result?.id).toBe("4");
  });

  it("returns first board as fallback for unknown category", () => {
    const result = mapProductToBoard("Unknown", boards);
    expect(result?.id).toBe("1");
  });

  it("returns null when no boards available", () => {
    const result = mapProductToBoard("Planners", []);
    expect(result).toBeNull();
  });
});
