export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // AWS S3
  awsBucket: process.env.AWS_S3_BUCKET ?? "",
  // Anthropic LLM
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  // Pinterest API
  pinterestAppId: process.env.PINTEREST_APP_ID ?? "",
  pinterestAppSecret: process.env.PINTEREST_APP_SECRET ?? "",
  // Email
  resendApiKey: process.env.RESEND_API_KEY ?? "",
};
