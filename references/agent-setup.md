# Autonomous Marketing Agent Setup

## Architecture

The agent is a tRPC router (`server/routers/agent.ts`) that calls `invokeLLM` server-side. The frontend at `/agent` provides a UI for triggering generation and reviewing output. All actions are logged to `agentLogs`.

## LLM Prompt Templates

### Social Post Generation

```ts
const systemPrompt = `You are a social media expert for a digital downloads store called ${STORE_NAME}.
The store sells premium printable templates, planners, and wall art.
Write engaging, platform-optimized posts that drive traffic to the store.
Always include relevant hashtags. Keep the brand voice: modern, clean, professional.`;

const userPrompt = `Write a ${platform} post about: ${topic}
Platform guidelines:
- Pinterest: 150-300 chars, keyword-rich description, 5-10 hashtags
- Instagram: 150-300 chars, conversational, 10-15 hashtags, call to action
- TikTok: 100-150 chars, trendy language, 3-5 hashtags, hook in first line
- Email: Subject line (50 chars max) + body (200-300 words) with clear CTA`;
```

### SEO Blog Post Generation

```ts
const systemPrompt = `You are an SEO content writer for a digital downloads store.
Write informative, keyword-optimized blog posts that rank on Google.
Include H2 subheadings, practical tips, and a CTA to browse the store.
Target word count: 800-1200 words.`;

const userPrompt = `Write a blog post targeting the keyword: "${keyword}"
Include:
- Compelling title with the keyword
- Introduction that hooks the reader
- 4-6 H2 sections with practical content
- Conclusion with CTA to visit the store
- Meta description (155 chars)`;
```

### Performance Report Generation

```ts
const systemPrompt = `You are a business analyst for a digital downloads store.
Analyze the provided metrics and give actionable recommendations.
Be specific, data-driven, and prioritize high-impact actions.`;

const userPrompt = `Analyze this store performance data and provide a weekly report:
${JSON.stringify(metrics, null, 2)}

Include:
1. Key wins this week
2. Areas needing attention
3. Top 3 actionable recommendations
4. Suggested flash sale or promotion for next week`;
```

## Scheduling Pattern

Use the Manus `schedule` tool to run the agent weekly:

```
Every Monday at 9am: Generate 7 days of social content (1 post/day per platform)
Every Sunday at 8pm: Generate weekly performance report and notify owner
Every 1st of month: Generate 2 SEO blog posts for top keywords
```

The agent logs all actions to `agentLogs` with `action`, `platform`, `content`, and `status` fields.

## Agent Dashboard UI Structure

```
/agent
├── Content Generator tab
│   ├── Platform selector (Pinterest / Instagram / TikTok / Email)
│   ├── Topic input
│   └── Generated content with copy button
├── Blog Generator tab
│   ├── Keyword input
│   └── Generated article with publish button
├── Performance Report tab
│   └── Generate report button → renders markdown report
├── Flash Sale Manager tab
│   ├── Active sale display with countdown
│   └── Create new sale form
└── Email Subscribers tab
    └── Subscriber count and list
```

## Owner Notifications

Use `notifyOwner` from `server/_core/notification.ts` to push alerts:

```ts
// Notify on new subscriber
await notifyOwner({
  title: 'New Email Subscriber',
  content: `${email} just subscribed to the Print Static newsletter.`
});

// Notify on new order
await notifyOwner({
  title: 'New Order',
  content: `Order #${orderId} — $${amount} — ${productNames.join(', ')}`
});
```
