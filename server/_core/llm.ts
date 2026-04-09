/**
 * LLM wrapper — uses the Anthropic Messages API.
 *
 * Replaces the Manus-hosted LLM proxy with a direct Anthropic call.
 * Keeps the same interface the codebase already expects.
 *
 * Required env var: ANTHROPIC_API_KEY
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface InvokeLLMOptions {
  messages: LLMMessage[];
  model?: string;
  maxTokens?: number;
}

/**
 * Invoke the LLM and return a response shaped like the OpenAI Chat
 * Completions format that the existing codebase expects:
 *
 *   { choices: [{ message: { content: "..." } }] }
 */
export async function invokeLLM(
  opts: InvokeLLMOptions
): Promise<{ choices: Array<{ message: { content: string } }> }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[LLM] ANTHROPIC_API_KEY not set — returning empty response");
    return { choices: [{ message: { content: "" } }] };
  }

  // Anthropic expects system as a top-level param, not in messages array
  const systemMsg = opts.messages.find((m) => m.role === "system");
  const userMessages = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        max_tokens: opts.maxTokens ?? 1024,
        system: systemMsg?.content ?? undefined,
        messages: userMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      console.error(`[LLM] Anthropic API error (${res.status}):`, err);
      return { choices: [{ message: { content: "" } }] };
    }

    const data = (await res.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const text = data.content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("") ?? "";

    return { choices: [{ message: { content: text } }] };
  } catch (err) {
    console.error("[LLM] invokeLLM failed:", err);
    return { choices: [{ message: { content: "" } }] };
  }
}
