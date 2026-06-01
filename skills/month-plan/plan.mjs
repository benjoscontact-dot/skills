#!/usr/bin/env node
// month-plan — generate a 4-week production recommendation.
//
// Output columns: Product, Type, Creator, Week, Hook, Format
// Writes a Markdown table to stdout and an Asana-import CSV next to this file.
//
// Usage:
//   node plan.mjs --month=2026-07
//   node plan.mjs --month=2026-07 --weeks=4 --config=./config.json
//
// config.json (all optional):
// {
//   "events":   [{ "week": 2, "count": 3, "products": ["Blackroll Kissen","Schlafkurs"] }],
//   "unavailable": [{ "creator": "Leona", "week": 3 }],     // creator off that week
//   "capacity": [{ "creator": "Stefan", "week": 1, "max": 2 }] // override a week's capacity
// }

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS, CREATORS, WEEKLY_TARGET, HOOKS, FORMATS_BY_KIND } from './roster.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- args ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const weeks = Number(args.weeks ?? 4);
const month = String(args.month ?? new Date().toISOString().slice(0, 7)); // YYYY-MM
const monthSeed = Number(month.slice(5, 7)) || 1; // offset rotations per month
const config = args.config && fs.existsSync(args.config) ? JSON.parse(fs.readFileSync(args.config, 'utf8')) : {};
const events = config.events ?? [];
const unavailable = config.unavailable ?? [];
const capacityOverrides = config.capacity ?? [];

const PRIORITY_WEIGHT = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 1 };

// ---------- per-week product schedule by priority ----------
function scheduleByType(type, quota) {
  const pool = PRODUCTS.filter((p) => p.type === type);
  // tickets: each product appears (priority weight) times, highest priority first
  const tickets = [];
  pool
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .forEach((p) => {
      for (let i = 0; i < (PRIORITY_WEIGHT[p.priority] ?? 1); i++) tickets.push(p.name);
    });
  const weekly = Array.from({ length: weeks }, () => []);
  let t = 0;
  for (let w = 0; w < weeks; w++) {
    while (weekly[w].length < quota) {
      let pick = null;
      // try not to repeat the same product within a week
      for (let tries = 0; tries < tickets.length; tries++) {
        const cand = tickets[(t + tries) % tickets.length];
        if (!weekly[w].includes(cand)) { pick = cand; t = t + tries + 1; break; }
      }
      if (!pick) { pick = tickets[t % tickets.length]; t++; }
      weekly[w].push(pick);
    }
  }
  return weekly; // weekly[w] = [productName, ...]
}

const infoByWeek = scheduleByType('info', WEEKLY_TARGET.info);
const physicalByWeek = scheduleByType('physical', WEEKLY_TARGET.physical);

// ---------- capacity per creator per week ----------
function capacityFor(creator, week /* 1-based */) {
  const ov = capacityOverrides.find((c) => c.creator === creator.name && c.week === week);
  if (ov) return ov.max;
  if (unavailable.some((u) => u.creator === creator.name && u.week === week)) return 0;
  if (creator.eventOnly) {
    const ev = events.find((e) => e.week === week);
    return ev ? (ev.count ?? creator.maxPerWeek) : 0;
  }
  return creator.maxPerWeek;
}

// ---------- assignment ----------
const used = {}; // `${creator}|${week}` -> count
const remaining = (creator, week) => capacityFor(creator, week) - (used[`${creator.name}|${week}`] ?? 0);
const take = (creator, week) => { used[`${creator.name}|${week}`] = (used[`${creator.name}|${week}`] ?? 0) + 1; };

function canFilm(creator, product) {
  if (product.type === 'info' && !creator.filmsInfo) return false;
  if (product.type === 'physical' && !creator.filmsPhysical) return false;
  if (creator.only && !creator.only.includes(product.name)) return false;
  return true;
}

function pickCreator(product, week, eventProducts) {
  // Prefer event team on event weeks for the event's products.
  const ordered = CREATORS.slice().sort((a, b) => {
    const aEvent = a.eventOnly && eventProducts.includes(product.name) ? 1 : 0;
    const bEvent = b.eventOnly && eventProducts.includes(product.name) ? 1 : 0;
    if (aEvent !== bEvent) return bEvent - aEvent;
    return remaining(b, week) - remaining(a, week); // spread load
  });
  for (const c of ordered) {
    if (canFilm(c, product) && remaining(c, week) > 0) return c;
  }
  return null;
}

const productByName = Object.fromEntries(PRODUCTS.map((p) => [p.name, p]));
const hookUsedByProduct = {}; // product -> Set(hooks)
let hookCursor = monthSeed; // rotate hooks, offset per month
const formatCursor = {}; // kind -> index

function pickHook(productName) {
  const seen = (hookUsedByProduct[productName] ??= new Set());
  for (let i = 0; i < HOOKS.length; i++) {
    const h = HOOKS[(hookCursor + i) % HOOKS.length];
    if (!seen.has(h)) { hookCursor = (hookCursor + i + 1) % HOOKS.length; seen.add(h); return h; }
  }
  const h = HOOKS[hookCursor % HOOKS.length];
  hookCursor++;
  return h;
}

function pickFormat(kind) {
  const opts = FORMATS_BY_KIND[kind] ?? ['UGC'];
  const i = (formatCursor[kind] = (formatCursor[kind] ?? monthSeed) + 1);
  return opts[i % opts.length];
}

const rows = [];
const unfilled = [];
for (let w = 1; w <= weeks; w++) {
  const ev = events.find((e) => e.week === w);
  const eventProducts = ev?.products ?? [];
  // physical first (more capacity-constrained), then info
  const weekProducts = [
    ...physicalByWeek[w - 1].map((n) => productByName[n]),
    ...infoByWeek[w - 1].map((n) => productByName[n]),
  ];
  for (const product of weekProducts) {
    const creator = pickCreator(product, w, eventProducts);
    if (!creator) { unfilled.push({ week: w, product: product.name, type: product.type }); continue; }
    take(creator, w);
    rows.push({
      Product: product.name,
      Type: product.type,
      Creator: creator.name,
      Week: w,
      Hook: pickHook(product.name),
      Format: pickFormat(creator.kind),
    });
  }
}

// ---------- output: markdown table ----------
const COLS = ['Product', 'Type', 'Creator', 'Week', 'Hook', 'Format'];
const pad = (s, n) => String(s).padEnd(n);
const widths = COLS.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c]).length)));
const line = (cells) => '| ' + cells.map((c, i) => pad(c, widths[i])).join(' | ') + ' |';

console.log(`\n# Production plan — ${month}  (${weeks} weeks, ${rows.length} concepts)\n`);
console.log(line(COLS));
console.log('| ' + widths.map((w) => '-'.repeat(w)).join(' | ') + ' |');
rows
  .slice()
  .sort((a, b) => a.Week - b.Week || a.Type.localeCompare(b.Type))
  .forEach((r) => console.log(line(COLS.map((c) => r[c]))));

// ---------- output: per-week summary ----------
console.log('\n## Weekly load\n');
for (let w = 1; w <= weeks; w++) {
  const wk = rows.filter((r) => r.Week === w);
  const info = wk.filter((r) => r.Type === 'info').length;
  const phys = wk.filter((r) => r.Type === 'physical').length;
  console.log(`- Week ${w}: ${info} info + ${phys} physical = ${wk.length} concepts`);
}
const hookSet = new Set(rows.map((r) => r.Hook));
console.log(`\nHook diversity: ${hookSet.size} of ${HOOKS.length} hooks used.`);
if (unfilled.length) {
  console.log(`\n⚠️  ${unfilled.length} slot(s) had no available creator (capacity gap):`);
  unfilled.forEach((u) => console.log(`   - Week ${u.week}: ${u.product} (${u.type})`));
}

// ---------- output: Asana CSV ----------
const csv = [COLS.join(',')]
  .concat(
    rows
      .slice()
      .sort((a, b) => a.Week - b.Week)
      .map((r) => COLS.map((c) => `"${String(r[c]).replace(/"/g, '""')}"`).join(',')),
  )
  .join('\n');
const outPath = path.join(__dirname, `plan-${month}.csv`);
fs.writeFileSync(outPath, csv);
console.log(`\nAsana-import CSV written to: ${outPath}`);
