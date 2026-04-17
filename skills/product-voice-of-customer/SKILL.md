---
name: product-voice-of-customer
description: Builds a tight, accurate voice-of-customer (VoC) and tone-of-voice document for a product using real verbatim quotes from Reddit, YouTube, TikTok, Instagram, and Amazon. Use when the user asks for "voice of customer", "tone of voice", "real customer quotes", "exact wording customers use", "Reddit quotes for my product", "Amazon top and bottom reviews", "ad copy research", or when they want to align short-form video hooks with written customer language. Usually runs AFTER the product-research-keywords skill, using its subreddits/handles/competitor list as inputs.
---

# Product Voice-of-Customer

This skill produces ONE clean tone-of-voice document per product by pulling verbatim quotes from sources the agent can actually access (Reddit, YouTube transcripts, public web) and combining them with content the user pastes in (Amazon reviews, TikTok/Instagram captions).

Keep the final doc under ~4 pages. Accuracy and fidelity to real customer language matter more than volume.

## When to use

Use this skill when the user:

- Asks for "voice of customer", "tone of voice", "real quotes", "verbatim", or "ad copy research" for a product
- Has already gotten keywords/subreddits from the `product-research-keywords` skill and wants to go deeper
- Wants a synthesis of what people say on Reddit, short-form video, and Amazon about a category

If the user only names a product, first run through the `product-research-keywords` skill (or ask for its output) so you have subreddits, competitor names, and video search terms to work with.

## Defaults

Unless the user says otherwise, assume:

- **3 competitors** per run (named by user or chosen from the keyword-skill output by gut feeling)
- **Target country**: ask the user if unclear. Default to `amazon.com` for EN products and `amazon.de` for DACH/DE products (URL contains `/de/`, brand is German, etc.)
- **Amazon reviews**: the user pastes them. Always link the exact Amazon product pages for the 3 competitors so they can copy/paste fast.
- **Demographics**: infer from language (e.g. "marathon PR", "masters athlete", "new mom", "bootstrapped founder"). No persona intake.
- **Quote count**: 15 Reddit quotes, top 5 + bottom 5 Amazon reviews per competitor, ~5 short-form video hooks per platform.

## Instructions

### Step 0 — Confirm inputs (one short message, then proceed)

Before fetching anything, confirm in a single message:

1. Product name + 1-line description
2. Target country / market (to pick the right Amazon domain)
3. 3 competitor product names (agent picks if user doesn't)
4. Whether to pull Reddit quotes in the target language only, or also English if the target market is non-English

Then proceed without waiting unless the user pushes back.

### Step 1 — Reddit (auto-fetch verbatim quotes)

Use Reddit's public JSON endpoints via WebFetch. These work without auth:

- Subreddit search: `https://www.reddit.com/r/<sub>/search.json?q=<query>&restrict_sr=on&sort=relevance&t=year&limit=25`
- Site-wide search: `https://www.reddit.com/search.json?q=<query>&sort=relevance&t=year&limit=25`
- Full thread: append `.json` to any thread URL, e.g. `https://www.reddit.com/r/running/comments/abc123/title/.json`

For each relevant subreddit from the keyword skill (or your own list), run 2–4 targeted queries mixing product names, competitor names, and pain phrases (`"heavy legs"`, `"worth it"`, `"vs Normatec"`, etc.).

Harvesting rules:
- **Verbatim only** — copy the exact wording, including typos and slang. Do not clean up grammar.
- Every quote needs a permalink, subreddit, and approximate date.
- Skip mod posts, bots, and obvious promotional/affiliate content.
- Prefer quotes with ≥5 upvotes when possible, but include ungilded quotes if the language is vivid.

Pick the top 15 quotes across these loosely-defined segments (pick 3–5 segments that fit the product):

- Heavy user / power user / pro
- Mainstream enthusiast
- Curious beginner / first-time buyer
- Skeptic / objector
- Switcher (from a competitor)
- Regret / churn
- Gift buyer / proxy buyer (spouse, parent, coach buying for someone)

Label each quote with its segment and a 1-line "why it matters" note (pain, desire, objection, or phrasing gem).

### Step 2 — YouTube (auto-fetch transcripts where possible)

Use WebSearch to find the top-viewed videos for the small-niche queries from the keyword skill. Prioritise:

- Product reviews of each of the 3 competitors
- "Is X worth it?" videos
- Honest comparisons and 30-day trials

For each shortlisted video, try WebFetch on the YouTube URL with a prompt asking for the transcript / captions / on-screen text. If YouTube returns thin content, fall back to:

1. WebFetch on `https://r.jina.ai/https://www.youtube.com/watch?v=<id>` (a public reader that often exposes transcripts) — mark as `[best-effort]` if used.
2. If both fail, ask the user to click "Show transcript" on YouTube and paste.

Pull ~5 punchy opening lines (first 10 seconds) + ~5 "honest review" beats (the moment the reviewer says "but…", "here's the thing…", "one thing I didn't love…"). Keep verbatim.

### Step 3 — TikTok + Instagram Reels (user-paste workflow)

I cannot reliably fetch TikTok or Instagram. Ask the user to:

1. Open 5–10 top Reels/TikToks from the small-niche search terms in the keyword skill
2. For each, copy (a) the caption, (b) the on-screen text, (c) the first-line audio hook, (d) view count + handle if visible, and paste into the chat

Give the user a template they can just fill in:

```
Platform: [TikTok | Reel]
Handle: @
Views/Likes:
Hook (first 1.5s):
On-screen text:
Caption:
```

If the user pushes back, proceed without short-form video and note the gap in the final doc.

### Step 4 — Amazon (always remind, always link)

Always do both of these, every run, in the same message:

1. **Paste the Amazon product links** for the 3 competitors on the correct domain (amazon.com, amazon.de, amazon.co.uk, etc.). Use direct product pages, not search results, when possible.
2. **Remind the user** in plain language to paste, for each competitor:
   - Top 5 reviews (sorted by "Most helpful" or highest-rated useful ones)
   - Bottom 5 reviews (sorted by 1-star, filtered to "Verified Purchase")

Template to give the user:

```
Competitor 1: [name]
  Top 5 reviews: (paste here)
  Bottom 5 reviews: (paste here)

Competitor 2: [name]
  Top 5: ...
  Bottom 5: ...

Competitor 3: [name]
  Top 5: ...
  Bottom 5: ...
```

If the user only pastes some, work with what you have and flag the gaps.

Amazon link guidance:
- If unsure of a product's exact ASIN, provide a search URL: `https://www.amazon.com/s?k=<product+name>` or `https://www.amazon.de/s?k=<product+name>`
- Mark links as `[verify — search result, not product page]` so the user knows to pick the right variant (size, colour, pack).

### Step 5 — Synthesize the document

Deliver one doc with exactly these sections, in this order:

**1. Product + scope** (3 lines)
Product, target country, 3 competitors, date of research.

**2. Top 15 Reddit quotes** (the meat)
Grouped by segment. Each entry:

```
> "verbatim quote"
— r/subreddit, <approximate date>, <permalink>
Segment: <segment>. Why it matters: <one line>.
```

**3. Short-form video hooks**
Table with columns: `Platform | Handle | Views | Hook | Why it works`. 10–15 rows total across YouTube/TikTok/Reels. Transcribe hooks verbatim.

**4. Amazon — top 5 + bottom 5 per competitor**
For each of the 3 competitors:
- 5 positive-review one-sentence summaries + the single most vivid verbatim phrase from each
- 5 negative-review one-sentence summaries + the single most vivid verbatim phrase from each

**5. Synthesis (one page max)**
- **Recurring pains** (5–7 bullets, each with one supporting verbatim snippet)
- **Recurring desires** (5–7 bullets, same format)
- **Recurring objections** (5–7 bullets, same format)
- **Tone + register notes**: how customers talk (dry, earnest, self-deprecating, clinical, gear-nerd, etc.), sentence length, emoji use, slang, loanwords
- **Phrases to steal** (10–15 short phrases lifted verbatim that would work as ad hooks or headlines)
- **Phrases to avoid** (things the category says that sound marketing-y, cliché, or that customers mock)

### Step 6 — Close with next steps

End the doc with a short "what to do with this" section (3 bullets max). Examples:
- Draft 5 ad hooks using phrases from section 5's "phrases to steal"
- Record 3 TikToks that mirror the top-performing hook structure in section 3
- Write a long-form landing-page section answering the top 3 objections from section 5

## Guardrails

- **Verbatim means verbatim.** Never paraphrase a quote and present it as a quote. If you must shorten, use `[…]` and preserve the wording around it.
- **Attribution always.** Every quote needs a source (subreddit + permalink, or video handle, or Amazon review reference). No source = don't include it.
- **Don't fabricate quotes.** If a section is thin (e.g. user didn't paste Amazon reviews), write `[gap — waiting on user paste]` rather than inventing.
- **Respect user content.** Do not post these quotes back to the original platforms or use them to astroturf. This is research output only.
- **Localise.** If the product is DACH-targeted, pull German subreddits (`r/de`, `r/Laufen`, `r/Fahrrad`, `r/Fitness_de` *[verify]*) and German Amazon. Don't over-translate — keep the original language in the quote and add an English gloss only if the user is non-native.
- **Flag uncertainty.** Mark `[best-effort transcript]`, `[search URL, verify product]`, `[unverified subreddit name]` wherever appropriate.
- **Keep the doc tight.** If a section balloons past its intended size, cut quotes, don't pad. Five vivid quotes beat fifteen mediocre ones.

## Handoff to related skills

- Upstream: `product-research-keywords` — run this first to generate subreddit lists, competitor names, and video search terms.
- Downstream (user-driven): the "phrases to steal" output is the raw material for ad-copy drafting, landing-page headlines, and script hooks.
