---
name: product-research-keywords
description: Generates research keywords and search queries for a new or existing product the user is working on. Use when the user uploads or references product research files (briefs, specs, competitor notes, customer interviews, market research) and asks for inspiration, search terms, hashtags, subreddits, or places to look on Instagram Reels, TikTok Shorts, YouTube Shorts, Reddit, or Amazon reviews. Triggers include "I'm working on a new product", "give me keywords to research", "what should I search for on TikTok/Reels/Reddit", "find inspiration for this product", "what similar products should I look at".
---

# Product Research Keywords

This skill turns product research (briefs, specs, competitor lists, customer quotes, positioning notes) into a structured set of keywords, hashtags, subreddits, and similar-product names the user can plug into Instagram Reels, TikTok Shorts, YouTube Shorts, Reddit, and Amazon to find creative inspiration and customer language.

## When to use

Use this skill when the user:

- Has a new product or is iterating on an existing one and shares research files, notes, or a brief
- Asks for "keywords", "search terms", "hashtags", "subreddits", "inspiration", or "what to look up" for a product
- Mentions researching short-form video (Reels / TikToks / Shorts), Reddit threads, or Amazon reviews
- Asks "what similar products should I look at?" or "what's the broader niche?"

If the user only shares a product name with no context, ask one quick question to surface the audience, the problem the product solves, and the format of content they want to find. Otherwise, read the uploaded files first and proceed.

## Instructions

### Step 1 — Read the research and extract the product signal

Read every file the user uploaded or referenced. Pull out, in bullet form:

1. **Product** — one sentence: what it is, form factor, price point
2. **Core problem / job-to-be-done** — what the customer is trying to accomplish
3. **Target audience** — demographic + psychographic (age, gender, identity, lifestyle, income bracket if known)
4. **Emotional hooks** — fears, desires, frustrations, aspirations mentioned in the research
5. **Competitors / alternatives** — named products or generic substitutes
6. **Distinctive angles** — unique mechanism, ingredient, design, claim, or story

Show this summary back to the user before the keyword output so they can correct assumptions early.

### Step 2 — Build the three-tier niche map

Organise every keyword output into three tiers. Be explicit about which tier each bucket belongs to.

| Tier | Definition | Purpose for the user |
| --- | --- | --- |
| **Big niche** | The broad category / lifestyle the product lives inside | Find cultural trends, aesthetic references, audience language |
| **Medium niche** | Similar products and adjacent categories serving the same job-to-be-done | See how comparable products are marketed, what hooks land |
| **Small niche** | The exact product category or near-identical alternatives | Find direct competitor content, reviews, and customer objections |

Example for a magnesium sleep spray:
- Big niche: sleep, wellness, nervous-system regulation, cortisol, "that girl" routines
- Medium niche: sleep supplements, melatonin gummies, sleep teas, bedtime routines, ashwagandha
- Small niche: magnesium spray, topical magnesium, magnesium oil, transdermal magnesium

### Step 3 — Generate platform-specific research lists

For each of the three tiers, produce the following. Label sections clearly so the user can copy-paste directly into each platform's search bar.

#### Instagram Reels
- 8–12 search terms (mix plain-language and category terms)
- 8–12 hashtags (mix of high-volume and niche, include `#` symbol)
- 3–5 creator archetypes or account handles to browse if the research hints at any

#### TikTok Shorts
- 8–12 search terms written the way Gen Z / target audience types them (lowercase, conversational, includes "pov", "get ready with me", "honest review", "day in my life" formats where relevant)
- 6–10 hashtags
- 3–5 sound / trend angles if the research suggests any (e.g. "before/after transitions", "text-on-screen confession style")

#### YouTube Shorts (and longer-form if useful)
- 8–12 search terms phrased as questions or how-tos ("how to ___", "best ___ for ___", "___ honest review", "I tried ___ for 30 days")
- 4–6 channel types or named creators worth browsing if signalled by the research

#### Reddit
- 6–10 subreddits ranked by relevance, written as `r/subredditname`
- 6–10 in-thread search queries to run with Reddit's search (e.g. `best magnesium spray site:reddit.com`, `"doesn't work" magnesium spray`, `magnesium spray vs pills`)
- Note any subreddit-specific rules that might block promotional posts so the user only lurks there

#### Amazon reviews (competitor mining)
- 5–10 named similar products to pull up on Amazon, with the exact search string to find them
- Suggest filtering to 3-star reviews first (most honest signal), then 1-star for objections, then 5-star for phrases customers use when they love it
- 6–10 specific review-phrase searches to run inside Amazon reviews using Cmd/Ctrl-F (e.g. "wish it", "finally", "smells like", "didn't work", "worth it", "compared to")

### Step 4 — Add a "voice-of-customer" phrase bank

Separately, list 10–20 raw phrases, pains, and desires pulled from (or inferred from) the research. These are hooks the user can test as video openers or ad copy. Mark each as `pain`, `desire`, or `objection`.

### Step 5 — Deliver the output

Structure the final message to the user like this, with visible headers:

1. Product signal summary (from Step 1)
2. Three-tier niche map (from Step 2)
3. Platform research lists, grouped by tier then by platform (from Step 3)
4. Voice-of-customer phrase bank (from Step 4)
5. Suggested research order (e.g. "Start with Reddit + Amazon reviews for language, then TikTok for hooks, then Reels/Shorts for aesthetic") — 3–5 bullets tailored to this specific product

Keep the whole output scannable. Use tables or tight bulleted lists, never long paragraphs. If the research is thin, flag the gaps explicitly and ask the user to fill them before generating more tiers.

## Guardrails

- **Do not invent research** — if a detail (e.g. a competitor name, a subreddit) isn't in the files and you are not confident it exists, mark it as `[unverified — please check]` rather than presenting it as fact.
- **Localise where relevant** — if the research signals a specific country or language, generate keywords in that language too.
- **Respect platform rules** — never suggest spammy tactics, fake reviews, review farming, or astroturfing. Research and inspiration only.
- **Stay concrete** — prefer specific phrases the target audience would actually type over generic marketing jargon.
