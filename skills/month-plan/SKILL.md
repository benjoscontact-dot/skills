---
name: month-plan
description: Generate a 4-week Meta-ads production plan for a creative agency. Use when the user wants to plan the month ahead, asks "what should I produce this month", wants a content-calendar recommendation, or needs to assign concepts to creators/weeks. Produces a table of Product, Type, Creator, Week, Hook, Format and an Asana-import CSV.
---

# Month Plan

Generates a month-ahead production recommendation: for each concept to produce it
assigns **Product, Type, Creator, Week, Hook, Format**, honouring the weekly target
(3 info + 4 physical), each creator's filming capacity and what they can film, event
weeks, and hook diversity. Output is a Markdown table plus an Asana-import CSV.

## When to use

- Start of the month ("plan the next 4 weeks", "what should I produce in July").
- Whenever capacity or events change and the plan needs a refresh.

## How to run it

1. **Ask the user for this month's inputs** (keep it quick — all optional except month):
   - Month, e.g. `2026-07`.
   - Any **events** this month: which week, how many concepts, which products.
   - Any **creator time off** or **capacity changes** this week.

2. **Build a config file** only if there are events / changes. Shape:
   ```json
   {
     "events":      [{ "week": 2, "count": 3, "products": ["Blackroll Kissen","Schlafkurs"] }],
     "unavailable": [{ "creator": "Leona", "week": 3 }],
     "capacity":    [{ "creator": "Stefan", "week": 1, "max": 2 }]
   }
   ```

3. **Run the script** from the skill folder:
   ```bash
   node plan.mjs --month=2026-07               # plain month
   node plan.mjs --month=2026-07 --config=./config.json   # with events/changes
   node plan.mjs --month=2026-07 --weeks=5     # 5-week month
   ```

4. **Show the user the Markdown table** the script prints, plus the per-week load,
   hook diversity, and any capacity-gap warnings. Point them at the generated
   `plan-<month>.csv`.

## Getting it into Asana

The CSV columns map 1:1 to Asana custom fields. In Asana:
**Project → ⋯ → Import → CSV**, then map `Product, Type, Creator, Week, Hook, Format`
to your custom fields (or use the [CSV importer](https://asana.com/guide/help/api/csv-importer)).
Each row becomes one task = one concept to brief.

## Changing the roster

Edit `roster.mjs` — products (name/type/priority), creators (capacity + what they can
film), the weekly target, the 9 hooks, and formats per creator kind. This is the only
file you touch when people or products change; the monthly run never needs editing.

## Notes

- The plan is **deterministic** for the same inputs, and rotates hooks/formats by month
  so two months don't look identical.
- Capacity gaps (a slot with no eligible creator free) are reported, not silently dropped.
- This is a *recommendation* — the user edits freely after import. The 50/30/20
  iteration/adjacent/net-new split is intentionally left to the user/library, to keep
  this step simple.
