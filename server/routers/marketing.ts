/**
 * Marketing automation router
 * 
 * Procedures:
 * - triggerPostPurchaseSequence: enqueue 3-email sequence after a purchase
 * - processEmailQueue: send all due emails (called by cron)
 * - generateBlogPost: AI writes an SEO blog post targeting a keyword
 * - generateWeeklyDigest: AI compiles weekly performance summary and emails owner
 * - generateSocialQueue: AI generates a week of social posts for all platforms
 * - getScheduledPosts: list all social posts in the queue
 * - updatePostStatus: approve/skip/mark-posted a social post
 * - getEmailQueueStats: stats on email queue
 * - getMarketingStats: overview of all marketing automation activity
 */
import { z } from "zod";
import { adminProcedure, publicProcedure, protectedProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import {
  enqueueEmail, getPendingEmails, markEmailSent, markEmailFailed,
  getEmailQueueStats, createScheduledPost, getScheduledPosts,
  updateScheduledPostStatus, deleteScheduledPost,
  createBlogPost, getBlogPosts, publishBlogPost, deleteBlogPost,
  getStoreStats, getAllOrders, getEmailSubscribers, logAgentAction,
} from "../db";
import { products } from "../../client/src/lib/products";

// âââ Email HTML builder âââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export function buildEmailHtml(opts: {
  title: string;
  preheader: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
      <!-- Header -->
      <tr>
        <td style="background:#0d0d0d;padding:24px 32px;">
          <span style="color:#00c4a7;font-size:20px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">PRINT_STATIC</span>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.7;">
          ${opts.body}
          ${opts.ctaText && opts.ctaUrl ? `
          <div style="margin-top:32px;text-align:center;">
            <a href="${opts.ctaUrl}" style="display:inline-block;background:#00c4a7;color:#ffffff;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;letter-spacing:0.5px;">${opts.ctaText}</a>
          </div>` : ""}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#f9f9f9;padding:20px 32px;border-top:1px solid #e8e8e8;">
          <p style="margin:0;font-size:12px;color:#888;text-align:center;">
            Â© ${new Date().getFullYear()} Print Static Â· Premium Digital Downloads<br>
            <a href="https://printstatic.com" style="color:#00c4a7;text-decoration:none;">printstatic.com</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// âââ Router âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export const marketingRouter = {

  /**
   * Enqueue a 3-email post-purchase sequence for a customer.
   * Called internally after a successful order webhook.
   */
  triggerPostPurchaseSequence: publicProcedure
    .input(z.object({
      orderId: z.number(),
      customerEmail: z.string().email(),
      customerName: z.string().optional(),
      productIds: z.array(z.string()),
      downloadUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      const name = input.customerName?.split(" ")[0] ?? "there";
      const productNames = input.productIds
        .map(id => products.find(p => p.id === id)?.name ?? id)
        .join(", ");

      const now = new Date();

      // Email 1: Immediate download confirmation
      await enqueueEmail({
        toEmail: input.customerEmail,
        toName: input.customerName ?? undefined,
        emailType: "purchase_confirm",
        subject: "â Your files are ready â Print Static",
        htmlBody: buildEmailHtml({
          title: "Your files are ready",
          preheader: `Download your ${productNames} now`,
          body: `<h2 style="margin:0 0 16px;font-size:24px;">Hi ${name}, your files are ready! ð</h2>
<p>Thank you for your purchase. Your download is waiting for you:</p>
<p><strong>${productNames}</strong></p>
<p>Click the button below to access your files. You can re-download them anytime from your Order History.</p>`,
          ctaText: "Download Your Files â",
          ctaUrl: input.downloadUrl,
        }),
        orderId: input.orderId,
        sendAt: now,
      });

      // Email 2: Tips & tricks (24 hours later)
      const tips24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await enqueueEmail({
        toEmail: input.customerEmail,
        toName: input.customerName ?? undefined,
        emailType: "tips_followup",
        subject: "ð¨ï¸ 5 tips for perfect home printing â Print Static",
        htmlBody: buildEmailHtml({
          title: "5 tips for perfect home printing",
          preheader: "Get the best results from your new templates",
          body: `<h2 style="margin:0 0 16px;font-size:22px;">Get the most from your templates</h2>
<p>Hi ${name}! Here are 5 quick tips to get perfect prints every time:</p>
<ol style="padding-left:20px;">
  <li style="margin-bottom:10px;"><strong>Use "Fit to Page"</strong> in your print dialog to avoid cropping.</li>
  <li style="margin-bottom:10px;"><strong>Print on 80â90gsm paper</strong> for crisp, professional results.</li>
  <li style="margin-bottom:10px;"><strong>Select "Best Quality"</strong> in your printer settings for sharp text.</li>
  <li style="margin-bottom:10px;"><strong>Use a PDF reader</strong> (Adobe Acrobat or Preview) rather than your browser for printing.</li>
  <li style="margin-bottom:10px;"><strong>Print a test page first</strong> on plain paper before using premium stock.</li>
</ol>
<p>Need help? Reply to this email and we'll get back to you within 24 hours.</p>`,
          ctaText: "Browse More Templates â",
          ctaUrl: "https://printstatic.com/shop",
        }),
        orderId: input.orderId,
        sendAt: tips24h,
      });

      // Email 3: Upsell (3 days later)
      const upsell3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      await enqueueEmail({
        toEmail: input.customerEmail,
        toName: input.customerName ?? undefined,
        emailType: "upsell",
        subject: "ð Customers who bought this also loved... â Print Static",
        htmlBody: buildEmailHtml({
          title: "You might also love these",
          preheader: "Handpicked templates based on your purchase",
          body: `<h2 style="margin:0 0 16px;font-size:22px;">Hi ${name}, here's what customers like you also love</h2>
<p>Based on your recent purchase, we think you'd love these:</p>
<ul style="padding-left:20px;">
  <li style="margin-bottom:10px;"><strong>Habit Tracker</strong> â Build better habits with our 30-day tracker</li>
  <li style="margin-bottom:10px;"><strong>Budget Planner</strong> â Take control of your finances</li>
  <li style="margin-bottom:10px;"><strong>Goal Workbook</strong> â Turn your goals into action plans</li>
</ul>
<p>All available as instant downloads. Use code <strong>RETURN10</strong> for 10% off your next order.</p>`,
          ctaText: "Shop Now â",
          ctaUrl: "https://printstatic.com/shop",
        }),
        orderId: input.orderId,
        sendAt: upsell3d,
      });

      await logAgentAction({
        agentType: "marketing",
        action: "post_purchase_sequence_queued",
        payload: { orderId: input.orderId, email: input.customerEmail, emails: 3 },
        status: "success",
      });

      return { queued: 3 };
    }),

  /**
   * Process the email queue â send all emails whose sendAt has passed.
   * Designed to be called by a cron job every 5 minutes.
   * Uses the Manus owner notification as the email transport (no external SMTP needed).
   */
  processEmailQueue: adminProcedure
    .mutation(async () => {
      const pending = await getPendingEmails();
      let sent = 0;
      let failed = 0;

      const resendApiKey = process.env.RESEND_API_KEY;

      for (const email of pending) {
        try {
          // Send via Resend API if configured
          if (resendApiKey && email.toEmail) {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "Print Static <orders@printstatic.com>",
                to: email.toEmail,
                subject: email.subject,
                html: email.htmlBody,
              }),
            });

            if (!res.ok) {
              const errText = await res.text().catch(() => res.statusText);
              throw new Error(`Resend API ${res.status}: ${errText}`);
            }

            console.log(`[EmailQueue] Sent "${email.subject}" to ${email.toEmail}`);
          } else {
            console.log(`[EmailQueue] No RESEND_API_KEY â skipping send for "${email.subject}" to ${email.toEmail}`);
          }

          await logAgentAction({
            agentType: "marketing",
            action: "email_sent",
            payload: {
              to: email.toEmail,
              type: email.emailType,
              subject: email.subject,
            },
            status: "success",
          });
          await markEmailSent(email.id);
          sent++;
        } catch (e: any) {
          console.error(`[EmailQueue] Failed to send "${email.subject}" to ${email.toEmail}:`, e.message);
          await markEmailFailed(email.id, e.message);
          failed++;
        }
      }

      return { processed: pending.length, sent, failed };
    }),

  /**
   * Generate an SEO blog post targeting a keyword using AI.
   */
  generateBlogPost: adminProcedure
    .input(z.object({
      keyword: z.string().min(3),
      searchVolume: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert SEO content writer for Print Static, a premium digital downloads store selling printable planners, wall art, templates, and stationery at printstatic.com. Write engaging, helpful blog posts that rank on Google and drive traffic to the store. Always include natural mentions of relevant products and link opportunities. Write in a friendly, practical tone.`,
          },
          {
            role: "user",
            content: `Write a complete SEO blog post targeting the keyword: "${input.keyword}".

Requirements:
- Title: Compelling, includes the keyword naturally
- Length: 600-900 words
- Structure: H2 subheadings, short paragraphs, 1 bulleted list
- Include 2-3 natural mentions of Print Static products
- End with a call-to-action to visit printstatic.com
- Format: Return as JSON with fields: title, slug, excerpt (1-2 sentences), content (full HTML body)`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "blog_post",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                slug: { type: "string", description: "URL-safe slug, e.g. best-free-printable-planners-2025" },
                excerpt: { type: "string" },
                content: { type: "string", description: "Full HTML content of the blog post" },
              },
              required: ["title", "slug", "excerpt", "content"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = String(response.choices[0]?.message?.content ?? "{}");
      const post = JSON.parse(raw);

      await createBlogPost({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        keyword: input.keyword,
        searchVolume: input.searchVolume,
        published: false,
      });

      await logAgentAction({
        agentType: "seo",
        action: "blog_post_generated",
        payload: { keyword: input.keyword, title: post.title, slug: post.slug },
        status: "success",
      });

      return { title: post.title, slug: post.slug, excerpt: post.excerpt };
    }),

  /**
   * Generate a weekly performance digest and notify the owner.
   */
  generateWeeklyDigest: adminProcedure
    .mutation(async () => {
      const stats = await getStoreStats();
      const recentOrders = await getAllOrders();
      const last7 = recentOrders.filter(o => {
        const age = Date.now() - new Date(o.createdAt).getTime();
        return age < 7 * 24 * 60 * 60 * 1000;
      });

      const weekRevenue = last7.reduce((sum, o) => sum + o.amountTotal, 0);
      const topProductCounts: Record<string, number> = {};
      for (const order of last7) {
        const ids = order.productIds as string[];
        for (const id of ids) {
          topProductCounts[id] = (topProductCounts[id] ?? 0) + 1;
        }
      }
      const topProducts = Object.entries(topProductCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => `${id} (${count} sales)`);

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a marketing analyst for Print Static, a digital downloads store. Write concise, actionable weekly performance summaries for the store owner.",
          },
          {
            role: "user",
            content: `Generate a weekly performance digest based on these stats:
- Orders this week: ${last7.length}
- Revenue this week: $${(weekRevenue / 100).toFixed(2)}
- Total all-time orders: ${stats.totalOrders}
- Total all-time revenue: $${(stats.totalRevenue / 100).toFixed(2)}
- Total customers: ${stats.totalCustomers}
- Email subscribers: ${stats.totalSubscribers}
- Top products this week: ${topProducts.join(", ") || "none yet"}

Write a 3-paragraph digest: (1) performance summary, (2) what's working, (3) 2-3 specific action recommendations for next week. Keep it concise and actionable.`,
          },
        ],
      });

      const digestContent = String(response.choices[0]?.message?.content ?? "Weekly digest unavailable.");

      await notifyOwner({
        title: `ð Weekly Digest â ${last7.length} orders, $${(weekRevenue / 100).toFixed(2)} revenue`,
        content: digestContent,
      });

      await logAgentAction({
        agentType: "performance",
        action: "weekly_digest_sent",
        payload: { orders: last7.length, revenue: weekRevenue, topProducts },
        status: "success",
      });

      return { orders: last7.length, revenue: weekRevenue, digest: digestContent };
    }),

  /**
   * Generate a week's worth of social media posts for all platforms.
   */
  generateSocialQueue: adminProcedure
    .input(z.object({
      platforms: z.array(z.enum(["instagram", "pinterest", "twitter", "facebook"])).default(["instagram", "pinterest", "twitter"]),
      postsPerPlatform: z.number().min(1).max(7).default(3),
    }))
    .mutation(async ({ input }) => {
      const productList = products.map(p => `${p.id}: ${p.name} ($${p.price})`).join("\n");
      let totalCreated = 0;

      for (const platform of input.platforms) {
        const platformGuide: Record<string, string> = {
          instagram: "Instagram: 150-200 chars, 5-10 hashtags, emoji-friendly, visual storytelling",
          pinterest: "Pinterest: 100-150 chars, keyword-rich description, focus on the printable's use case",
          twitter: "Twitter/X: under 240 chars, 1-2 hashtags, punchy and direct",
          facebook: "Facebook: 100-200 chars, conversational, community-focused",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a social media manager for Print Static, a premium digital downloads store at printstatic.com. Create engaging, platform-native social media posts that drive traffic and sales. Focus on the value customers get: instant download, print at home, beautiful designs.`,
            },
            {
              role: "user",
              content: `Create ${input.postsPerPlatform} social media posts for ${platform}.
Platform guidelines: ${platformGuide[platform]}

Available products:
${productList}

Return as JSON array. Each post must have: platform, productId, caption, hashtags (string), imageHint (brief description of ideal image for this post).`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "social_posts",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  posts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        platform: { type: "string" },
                        productId: { type: "string" },
                        caption: { type: "string" },
                        hashtags: { type: "string" },
                        imageHint: { type: "string" },
                      },
                      required: ["platform", "productId", "caption", "hashtags", "imageHint"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["posts"],
                additionalProperties: false,
              },
            },
          },
        });

        const raw = String(response.choices[0]?.message?.content ?? '{"posts":[]}');
        const { posts } = JSON.parse(raw);

        const now = new Date();
        for (let i = 0; i < posts.length; i++) {
          const post = posts[i];
          const scheduledFor = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
          const product = products.find(p => p.id === post.productId);
          await createScheduledPost({
            platform: post.platform as any,
            caption: post.caption,
            hashtags: post.hashtags,
            imageUrl: product?.image ?? undefined,
            productId: post.productId,
            scheduledFor,
            status: "draft",
          });
          totalCreated++;
        }
      }

      await logAgentAction({
        agentType: "marketing",
        action: "social_queue_generated",
        payload: { platforms: input.platforms, totalPosts: totalCreated },
        status: "success",
      });

      return { created: totalCreated };
    }),

  /**
   * Get all scheduled social media posts.
   */
  getScheduledPosts: adminProcedure
    .input(z.object({
      status: z.enum(["draft", "approved", "posted", "skipped"]).optional(),
    }))
    .query(async ({ input }) => {
      return getScheduledPosts(input.status);
    }),

  /**
   * Update the status of a scheduled post.
   */
  updatePostStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "approved", "posted", "skipped"]),
    }))
    .mutation(async ({ input }) => {
      await updateScheduledPostStatus(input.id, input.status);
      return { success: true };
    }),

  /**
   * Delete a scheduled post.
   */
  deletePost: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteScheduledPost(input.id);
      return { success: true };
    }),

  /**
   * Get all blog posts (admin: all, public: published only).
   */
  getBlogPosts: publicProcedure
    .input(z.object({ publishedOnly: z.boolean().default(false) }))
    .query(async ({ input }) => {
      return getBlogPosts(input.publishedOnly);
    }),

  /**
   * Publish a blog post.
   */
  publishBlogPost: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await publishBlogPost(input.id);
      return { success: true };
    }),

  /**
   * Delete a blog post.
   */
  deleteBlogPost: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBlogPost(input.id);
      return { success: true };
    }),

  /**
   * Get email queue stats.
   */
  getEmailQueueStats: adminProcedure
    .query(async () => {
      return getEmailQueueStats();
    }),

  /**
   * Get marketing overview stats.
   */
  getMarketingStats: adminProcedure
    .query(async () => {
      const [storeStats, emailStats, posts, blogPostsList] = await Promise.all([
        getStoreStats(),
        getEmailQueueStats(),
        getScheduledPosts(),
        getBlogPosts(false),
      ]);
      return {
        store: storeStats,
        email: emailStats,
        socialPosts: {
          total: posts.length,
          draft: posts.filter(p => p.status === "draft").length,
          approved: posts.filter(p => p.status === "approved").length,
          posted: posts.filter(p => p.status === "posted").length,
        },
        blog: {
          total: blogPostsList.length,
          published: blogPostsList.filter(p => p.published).length,
          drafts: blogPostsList.filter(p => !p.published).length,
        },
      };
    }),
};
