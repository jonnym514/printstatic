/**
 * Owner notification system.
 *
 * Replaces the Manus notification service with email via Resend
 * (or falls back to console logging if no API key is set).
 *
 * Optional env vars: RESEND_API_KEY, OWNER_EMAIL
 */

interface NotifyOptions {
  title: string;
  content: string;
}

const RESEND_URL = "https://api.resend.com/emails";

/**
 * Send a notification to the store owner.
 * Uses Resend API if configured, otherwise logs to console.
 */
export async function notifyOwner(opts: NotifyOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;

  // Always log for debugging
  console.log(`[Notification] ${opts.title}`);

  if (!apiKey || !ownerEmail) {
    console.log("[Notification] (email not configured — logged only)");
    console.log(opts.content);
    return;
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "PrintStatic <notifications@printstatic.com>",
        to: ownerEmail,
        subject: opts.title,
        text: opts.content,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      console.error(`[Notification] Resend API error (${res.status}):`, err);
    }
  } catch (err) {
    console.error("[Notification] Failed to send:", err);
  }
}
