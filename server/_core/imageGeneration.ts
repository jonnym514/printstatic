/**
 * Image generation stub.
 *
 * Used by the Pinterest integration to create pin images.
 * For now, returns the original product image unchanged.
 *
 * To enable AI image generation, add OPENAI_API_KEY and
 * implement the DALL-E or Stable Diffusion call here.
 */

interface GenerateImageOptions {
  prompt: string;
  originalImages?: Array<{ url: string; mimeType: string }>;
}

export async function generateImage(
  opts: GenerateImageOptions
): Promise<{ url: string }> {
  // Return the original image if available
  if (opts.originalImages?.length) {
    return { url: opts.originalImages[0].url };
  }

  // Placeholder — log warning and return empty
  console.warn("[ImageGen] No image generation service configured. Using placeholder.");
  return { url: "" };
}
