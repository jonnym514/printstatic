import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import {
  getStoreStats,
  getAgentLogs,
  getBlogPosts,
  getAllFlashSales,
  getEmailSubscribers,
  addEmailSubscriber,
  getSubscriberCount,
  createFlashSale,
  deleteFlashSale,
  createBlogPost,
  publishBlogPost,
  deleteBlogPost,
  logAgentAction,
} from "../db";

/**
 * Agent router for dashboard operations
 * Handles:
 * - Store statistics (query)
 * - Agent logs (query)
 * - Blog post management (query/mutation)
 * - Flash sale management (query/mutation)
 * - Email subscriber management (query/mutation)
 * - AI-powered content generation (mutation)
 */

export const agentRouter = router({
  // ── Store & Analytics ──────────────────────────────────────────────────────

  getStoreStats: publicProcedure.query(async () => {
    return getStoreStats();
  }),

  getLogs: publicProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(500).default(50),
    }))
    .query(async ({ input }) => {
      return getAgentLogs(undefined, input.limit);
    }),

  // ── Blog Posts ─────────────────────────────────────────────────────────────

  getBlogPosts: publicProcedure
    .input(z.object({
      publishedOnly: z.boolean().default(true),
    }))
    .query(async ({ input }) => {
      return getBlogPosts(input.publishedOnly);
    }),

  generateBlogPost: protectedProcedure
    .input(z.object({
      topic: z.string().min(1),
      keyword: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        // Call LLM to generate blog post content
        const content = await invokeLLM({
          prompt: `Write a professional blog post about "${input.topic}"${input.keyword ? ` targeting the keyword "${input.keyword}"` : ""}. Include a title, meta description, and body content in markdown format.`,
        });

        // Generate slug from topic
        const slug = input.topic
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .substring(0, 100);

        // Create blog post
        await createBlogPost({
          title: input.topic,
          slug,
          content,
          published: false,
          publishedAt: null,
          createdAt: new Date(),
        });

        // Log the action
        await logAgentAction({
          agentType: "blog_generator",
          action: "generate_blog_post",
          status: "success",
          details: JSON.stringify({ topic: input.topic, keyword: input.keyword }),
          createdAt: new Date(),
        });

        return { success: true, message: "Blog post generated successfully" };
      } catch (error) {
        await logAgentAction({
          agentType: "blog_generator",
          action: "generate_blog_post",
          status: "failed",
          details: JSON.stringify({ error: String(error) }),
          createdAt: new Date(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate blog post",
        });
      }
    }),

  publishBlogPost: protectedProcedure
    .input(z.object({
      id: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        await publishBlogPost(input.id);
        await logAgentAction({
          agentType: "blog_manager",
          action: "publish_blog_post",
          status: "success",
          details: JSON.stringify({ postId: input.id }),
          createdAt: new Date(),
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to publish blog post",
        });
      }
    }),

  deleteBlogPost: protectedProcedure
    .input(z.object({
      id: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        await deleteBlogPost(input.id);
        await logAgentAction({
          agentType: "blog_manager",
          action: "delete_blog_post",
          status: "success",
          details: JSON.stringify({ postId: input.id }),
          createdAt: new Date(),
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete blog post",
        });
      }
    }),

  // ── Flash Sales ────────────────────────────────────────────────────────────

  getAllFlashSales: publicProcedure.query(async () => {
    return getAllFlashSales();
  }),

  createFlashSale: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      productIds: z.array(z.string()).min(1),
      discountPercent: z.number().int().min(1).max(99),
      startsAt: z.date(),
      endsAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        await createFlashSale({
          name: input.name,
          productIds: input.productIds.join(","),
          discountPercent: input.discountPercent,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          active: true,
          createdAt: new Date(),
        });

        await logAgentAction({
          agentType: "flash_sale_manager",
          action: "create_flash_sale",
          status: "success",
          details: JSON.stringify({
            name: input.name,
            productCount: input.productIds.length,
            discount: input.discountPercent,
          }),
          createdAt: new Date(),
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create flash sale",
        });
      }
    }),

  deleteFlashSale: protectedProcedure
    .input(z.object({
      id: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        await deleteFlashSale(input.id);
        await logAgentAction({
          agentType: "flash_sale_manager",
          action: "delete_flash_sale",
          status: "success",
          details: JSON.stringify({ saleId: input.id }),
          createdAt: new Date(),
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete flash sale",
        });
      }
    }),

  // ── Email Subscribers ──────────────────────────────────────────────────────

  subscribeEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await addEmailSubscriber({
          email: input.email,
          name: input.name,
          source: input.source ?? "newsletter",
          active: true,
          createdAt: new Date(),
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to subscribe email",
        });
      }
    }),

  getSubscribers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return getEmailSubscribers();
  }),

  getSubscriberCount: publicProcedure.query(async () => {
    return getSubscriberCount();
  }),

  // ── AI Content Generation ──────────────────────────────────────────────────

  generateMarketing: protectedProcedure
    .input(z.object({
      productName: z.string().min(1),
      audience: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        // Call LLM to generate marketing copy
        const marketingCopy = await invokeLLM({
          prompt: `Generate compelling marketing copy for the product "${input.productName}"${input.audience ? ` targeting ${input.audience}` : ""}. Include headline, subheading, benefits, and call-to-action.`,
        });

        await logAgentAction({
          agentType: "marketing_generator",
          action: "generate_marketing_copy",
          status: "success",
          details: JSON.stringify({
            product: input.productName,
            audience: input.audience,
          }),
          createdAt: new Date(),
        });

        return {
          success: true,
          content: marketingCopy,
        };
      } catch (error) {
        await logAgentAction({
          agentType: "marketing_generator",
          action: "generate_marketing_copy",
          status: "failed",
          details: JSON.stringify({ error: String(error) }),
          createdAt: new Date(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate marketing copy",
        });
      }
    }),

  generatePerformanceReport: protectedProcedure
    .input(z.object({
      timeframe: z.enum(["week", "month", "quarter"]).default("month"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        // Fetch store stats and generate report
        const stats = await getStoreStats();

        const reportPrompt = `Generate a comprehensive performance report based on these metrics for the past ${input.timeframe}:
Total Revenue: $${stats.totalRevenue}
Total Orders: ${stats.totalOrders}
Total Customers: ${stats.totalCustomers}
Email Subscribers: ${stats.totalSubscribers}

Include insights on trends, recommendations for improvement, and key performance indicators.`;

        const report = await invokeLLM({ prompt: reportPrompt });

        await logAgentAction({
          agentType: "report_generator",
          action: "generate_performance_report",
          status: "success",
          details: JSON.stringify({ timeframe: input.timeframe }),
          createdAt: new Date(),
        });

        return {
          success: true,
          report,
          stats,
        };
      } catch (error) {
        await logAgentAction({
          agentType: "report_generator",
          action: "generate_performance_report",
          status: "failed",
          details: JSON.stringify({ error: String(error) }),
          createdAt: new Date(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate performance report",
        });
      }
    }),

  generateEmailCampaign: protectedProcedure
    .input(z.object({
      subject: z.string().min(1),
      campaignType: z.enum(["promotional", "newsletter", "announcement"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        // Call LLM to generate email campaign content
        const emailContent = await invokeLLM({
          prompt: `Generate an engaging email campaign for the subject "${input.subject}".
Type: ${input.campaignType}
Include: compelling body text, clear call-to-action, and personalization tips.
Format as HTML email template.`,
        });

        await logAgentAction({
          agentType: "email_campaign_generator",
          action: "generate_email_campaign",
          status: "success",
          details: JSON.stringify({
            subject: input.subject,
            type: input.campaignType,
          }),
          createdAt: new Date(),
        });

        return {
          success: true,
          emailContent,
          subject: input.subject,
        };
      } catch (error) {
        await logAgentAction({
          agentType: "email_campaign_generator",
          action: "generate_email_campaign",
          status: "failed",
          details: JSON.stringify({ error: String(error) }),
          createdAt: new Date(),
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate email campaign",
        });
      }
    }),
});
