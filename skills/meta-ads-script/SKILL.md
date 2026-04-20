---
name: meta-ads-script
description: Use this skill when the user wants to draft, format, or organize a Meta (Facebook / Instagram) ads script. Trigger on phrases like "meta ads script", "new ad script", "format this ad", "ads template", or when the user pastes a rough script and wants it turned into a creator-ready brief. Produces a standard brief with 5 hooks, 1 body, B-roll, and logistics that copies cleanly into Google Docs.
---

# Meta Ads Script Template

Turn a raw idea, a pasted rough script, or a few notes into a standardized Meta ads brief that a creator can shoot without asking follow-up questions.

## When to use

- User asks to write or draft a Meta / Facebook / Instagram ad script.
- User pastes an existing rough script and wants it formatted.
- User says "new ads template", "ad brief", or similar.

## How to run it

1. Ask the user whether they want to **draft from scratch** or **paste an existing script to format**.
2. Collect the logistics fields listed in the template. Ask for all missing ones in a single question. If the user says "skip" or "TBD" for a field, write `TBD` so the creator knows it still needs to be confirmed.
3. Fill the template below with the user's values, keeping the structure exactly as shown.
4. **Output the filled template as rendered markdown — do NOT wrap the final output in a fenced code block.** The user copies it directly into Google Docs, and a code block would paste as monospaced raw text instead of a real table and headings.

## Copy-paste rules (Google Docs)

Follow these so the paste lands clean:

- No fenced code blocks around the output.
- No horizontal rules (`---`) inside the body — they paste as literal dashes in some setups.
- Keep headings to `##` and `###` only.
- Use the pipe table exactly as shown. Rendered markdown tables paste into Google Docs as real tables.
- Do not put line breaks inside table cells. If a cell needs two ideas, separate with ` / `.
- Do not use emojis unless the user asks.

**How to copy it into Google Docs:** copy from the rendered markdown view (the chat pane or a markdown preview) — not from the raw `.md` file source and not from a terminal showing pipe characters. Rendered view → formatted paste (real table, headings, bold). Raw text → literal pipes and asterisks.

## Template

Fill in every `[...]` placeholder. Leave `TBD` for anything the user did not provide. Output everything below as rendered markdown (not inside a code block):

## Meta Ads Script — [Product / Brand]

**Offer:** [one-line offer, e.g. "20% off first order"]
**Location:** [where this is shot]
**Tone of voice:** [e.g. casual, bold, conversational, authoritative]
**Reference (winning video):** [URL]
**Asset upload link:** [Google Drive / Dropbox / Frame.io URL]
**Deadline:** [date]
**Aspect ratio:** [9:16 | 1:1 | 4:5]
**Duration target:** [15s | 30s | 60s]
**CTA:** [what the viewer should do at the end]

### Script

| Element | Creative direction / post-pro notes | Script |
|---|---|---|
| Hook 1 | [visual / delivery / cut notes] | [spoken line] |
| Hook 2 | [visual / delivery / cut notes] | [spoken line] |
| Hook 3 | [visual / delivery / cut notes] | [spoken line] |
| Hook 4 | [visual / delivery / cut notes] | [spoken line] |
| Hook 5 | [visual / delivery / cut notes] | [spoken line] |
| Body   | [visual / delivery / cut notes] | [spoken line] |

### B-Roll

- [shot 1 — what to capture, angle, action]
- [shot 2]
- [shot 3]
- [shot 4]

### Do's & Don'ts

**Do:** [e.g. keep energy high, show product clearly in first 3s]
**Don't:** [e.g. no medical claims, don't mention competitors]

## Notes for drafting hooks

When writing the 5 hooks, make them **distinct angles** — not five wordings of the same line. Common angles to mix:

- Problem / pain point
- Bold claim or contrarian take
- Curiosity gap / question
- Social proof or result
- Direct product reveal

If the user pasted a single hook, offer 4 more variations using different angles from the list above.
