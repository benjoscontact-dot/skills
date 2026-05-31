// Creative Strategy Planner — auto-suggest + validation logic.
// Ported from the provided auto_suggest.js with light TypeScript typing;
// the algorithm is unchanged.
import type { Product, Creator, Concept, PlanEvent, PlanSlot, Availability, HookType } from './types';

// ============================================================
// Constants
// ============================================================

const TARGET_RATIO = { iteration: 0.5, adjacent: 0.3, net_new: 0.2 };
const TARGET_RATIO_TOLERANCE = 0.1;
const MIN_HOOK_DIVERSITY = 5;

// Priority → weekly demand. Returns expected appearances per 4-week month.
const PRIORITY_FREQUENCY: Record<number, number> = {
  1: 4, // every week
  2: 3, // 3 of 4 weeks
  3: 2, // every other week
  4: 1, // once a month
  5: 1, // once a month (springer)
};

const NO_FILM_FORMATS = ['love_letter', 'voiceover', 'b_roll'];

type GenSlot = Omit<PlanSlot, 'id'>;

interface GenerateArgs {
  products: Product[];
  creators: Creator[];
  concepts: Concept[];
  events: PlanEvent[];
  availability: Availability;
  weeksInMonth: number;
}

// ============================================================
// generatePlan — main entry point
// ============================================================

export function generatePlan({
  products,
  creators,
  concepts,
  events,
  availability,
  weeksInMonth,
}: GenerateArgs): GenSlot[] {
  const slots: GenSlot[] = [];
  const usedConcepts = new Set<string>();

  // Step 1: place Event Team slots on event weeks
  const eventCreator = creators.find((c) => c.type === 'event-team');
  if (eventCreator) {
    events.forEach((event) => {
      const week = getWeekOfMonth(event.date);
      if (week < 1 || week > weeksInMonth) return;

      (event.products || []).forEach((productId, idx) => {
        const concept = pickBestConcept(concepts, {
          productId,
          preferStatus: 'iteration',
          exclude: usedConcepts,
          diversifyHooks: getUsedHookTypes(slots),
        });
        if (!concept) return;

        slots.push({
          week,
          creator_id: eventCreator.id,
          concept_id: concept.id,
          concept,
          is_event_slot: true,
          position: idx,
        });
        usedConcepts.add(concept.id);
      });
    });
  }

  // Step 2: build weekly demand schedule by product priority
  const demand = buildWeeklyDemand(products, weeksInMonth);

  // Subtract slots already filled by events
  slots.forEach((s) => {
    const pid = s.concept?.product_id;
    if (pid && demand[pid] && demand[pid][s.week - 1] > 0) {
      demand[pid][s.week - 1] -= 1;
    }
  });

  // Step 3: fill weekly demand respecting 50/30/20 ratio
  for (let week = 1; week <= weeksInMonth; week++) {
    for (const [productId, weekCounts] of Object.entries(demand)) {
      const need = weekCounts[week - 1] || 0;

      for (let i = 0; i < need; i++) {
        const desiredStatus = pickStatusForRatio(slots);

        const creator = findAvailableCreator({ creators, productId, week, availability, slots });
        if (!creator) continue; // capacity exhausted

        const concept = pickBestConcept(concepts, {
          productId,
          preferStatus: desiredStatus,
          exclude: usedConcepts,
          diversifyHooks: getUsedHookTypes(slots),
        });
        if (!concept) continue;

        slots.push({ week, creator_id: creator.id, concept_id: concept.id, concept });
        usedConcepts.add(concept.id);
      }
    }
  }

  // Step 4: fill backup lane (no-film concepts)
  const noFilmCreator = creators.find((c) => c.type === 'no-film');
  if (noFilmCreator) {
    for (let week = 1; week <= weeksInMonth; week++) {
      const topProduct = [...products].sort((a, b) => a.priority - b.priority)[0];

      const concept = pickBestConcept(concepts, {
        productId: topProduct?.id,
        preferFormat: NO_FILM_FORMATS,
        exclude: usedConcepts,
      });
      if (!concept) continue;

      slots.push({
        week,
        creator_id: noFilmCreator.id,
        concept_id: concept.id,
        concept,
        is_backup: true,
      });
      usedConcepts.add(concept.id);
    }
  }

  return slots;
}

// ============================================================
// validatePlan — runs on every grid change for the right panel
// ============================================================

export interface ValidationResult {
  total: number;
  iterationPct: number;
  adjacentPct: number;
  netNewPct: number;
  hookDiversity: number;
  productCounts: Record<string, number>;
  formatCounts: Record<string, number>;
  warnings: { severity: string; message: string }[];
  isValid: boolean;
}

export function validatePlan(slots: PlanSlot[], products: Product[]): ValidationResult {
  const total = slots.filter((s) => !s.is_backup).length;

  const statusCounts = countByStatus(slots);
  const iterationPct = total ? statusCounts.iteration / total : 0;
  const adjacentPct = total ? statusCounts.adjacent / total : 0;
  const netNewPct = total ? statusCounts.net_new / total : 0;

  const usedHooks = getUsedHookTypes(slots);

  const productCounts: Record<string, number> = {};
  slots.forEach((s) => {
    if (s.is_backup) return;
    const pid = s.concept?.product_id;
    if (pid) productCounts[pid] = (productCounts[pid] || 0) + 1;
  });

  const warnings: { severity: string; message: string }[] = [];

  if (Math.abs(iterationPct - TARGET_RATIO.iteration) > TARGET_RATIO_TOLERANCE) {
    warnings.push({
      severity: 'warning',
      message: `Iteration ratio off target: ${Math.round(iterationPct * 100)}% (target 50%)`,
    });
  }

  if (usedHooks.size < MIN_HOOK_DIVERSITY) {
    warnings.push({
      severity: 'warning',
      message: `Low hook diversity: ${usedHooks.size} of 9 types used`,
    });
  }

  const sortedProducts = [...products].filter((p) => p.active !== false).sort((a, b) => a.priority - b.priority);
  sortedProducts.forEach((p) => {
    const expected = PRIORITY_FREQUENCY[p.priority] ?? 1;
    const actual = productCounts[p.id] || 0;
    if (actual < expected) {
      warnings.push({
        severity: 'warning',
        message: `${p.name} underweight: ${actual} ads (priority ${p.priority} suggests ~${expected})`,
      });
    }
  });

  const formatCounts = countByFormat(slots);
  const formatEntries = Object.entries(formatCounts);
  if (formatEntries.length === 1 && total > 3) {
    warnings.push({
      severity: 'warning',
      message: `Only one format used (${formatEntries[0][0]}) — add variety`,
    });
  }

  return {
    total,
    iterationPct,
    adjacentPct,
    netNewPct,
    hookDiversity: usedHooks.size,
    productCounts,
    formatCounts,
    warnings,
    isValid: warnings.length === 0,
  };
}

// ============================================================
// Helpers
// ============================================================

function buildWeeklyDemand(products: Product[], weeksInMonth: number): Record<string, number[]> {
  const demand: Record<string, number[]> = {};
  const active = products.filter((p) => p.active !== false);

  active.forEach((p) => {
    const totalForMonth = PRIORITY_FREQUENCY[p.priority] ?? 1;
    demand[p.id] = new Array(weeksInMonth).fill(0);

    let remaining = totalForMonth;
    let week = 0;
    while (remaining > 0) {
      demand[p.id][week % weeksInMonth] += 1;
      remaining -= 1;
      week += Math.max(1, Math.floor(weeksInMonth / totalForMonth));
    }
  });

  return demand;
}

function pickStatusForRatio(slots: GenSlot[]): 'iteration' | 'adjacent' | 'net_new' {
  const counts = countByStatus(slots);
  const total = counts.iteration + counts.adjacent + counts.net_new || 1;

  const iterPct = counts.iteration / total;
  const adjPct = counts.adjacent / total;
  const newPct = counts.net_new / total;

  const gaps = {
    iteration: TARGET_RATIO.iteration - iterPct,
    adjacent: TARGET_RATIO.adjacent - adjPct,
    net_new: TARGET_RATIO.net_new - newPct,
  };
  const sorted = Object.entries(gaps).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as 'iteration' | 'adjacent' | 'net_new';
}

interface PickOpts {
  productId?: string;
  preferStatus?: string;
  exclude?: Set<string>;
  diversifyHooks?: Set<string>;
  preferFormat?: string[];
}

function pickBestConcept(concepts: Concept[], opts: PickOpts = {}): Concept | null {
  const { productId, preferStatus, exclude, diversifyHooks, preferFormat } = opts;

  let candidates = concepts.filter((c) => c.active !== false && !exclude?.has(c.id));

  if (productId) {
    candidates = candidates.filter((c) => c.product_id === productId);
  }

  if (preferFormat) {
    const matches = candidates.filter((c) => preferFormat.includes(c.format));
    if (matches.length) candidates = matches;
  }

  if (preferStatus) {
    const matches = candidates.filter((c) => c.status === preferStatus);
    if (matches.length) candidates = matches;
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => {
    if (diversifyHooks && diversifyHooks.size) {
      const aNovel = (a.hook_types || []).filter((h) => !diversifyHooks.has(h)).length;
      const bNovel = (b.hook_types || []).filter((h) => !diversifyHooks.has(h)).length;
      if (bNovel !== aNovel) return bNovel - aNovel;
    }
    return (b.last_roas || 0) - (a.last_roas || 0);
  });

  return candidates[0];
}

interface FindCreatorArgs {
  creators: Creator[];
  productId: string;
  week: number;
  availability: Availability;
  slots: GenSlot[];
}

function findAvailableCreator({ creators, productId, week, availability, slots }: FindCreatorArgs): Creator | null {
  const eligible = creators
    .filter((c) => c.type !== 'event-team' && c.type !== 'no-film')
    .filter((c) => c.active !== false)
    .filter((c) => !c.allowed_products?.length || c.allowed_products.includes(productId))
    .map((c) => {
      const max = availability?.[c.id]?.[week] ?? c.max_weekly_slots;
      const used = slots.filter((s) => s.creator_id === c.id && s.week === week && !s.is_backup).length;
      return { creator: c, free: max - used };
    })
    .filter((x) => x.free > 0)
    .sort((a, b) => b.free - a.free);

  return eligible[0]?.creator || null;
}

function countByStatus(slots: GenSlot[]) {
  return slots.reduce(
    (acc, s) => {
      if (s.is_backup) return acc;
      const status = s.concept?.status;
      if (status) acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { iteration: 0, adjacent: 0, whitespace: 0, net_new: 0 } as Record<string, number>,
  );
}

function countByFormat(slots: GenSlot[]) {
  return slots.reduce((acc, s) => {
    if (s.is_backup) return acc;
    const format = s.concept?.format;
    if (format) acc[format] = (acc[format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function getUsedHookTypes(slots: GenSlot[]): Set<string> {
  const set = new Set<string>();
  slots.forEach((s) => {
    (s.concept?.hook_types || []).forEach((h) => set.add(h));
  });
  return set;
}

function getWeekOfMonth(date: string): number {
  const d = new Date(date);
  return Math.ceil(d.getDate() / 7);
}

// ============================================================
// computeWhitespace — populate the "Whitespace" tab
// ============================================================

export interface WhitespaceSuggestion {
  product_id: string;
  product_name: string;
  suggestion_type: string;
  message: string;
  hook_id: string;
}

export function computeWhitespace({
  products,
  concepts,
  hookTypes,
}: {
  products: Product[];
  concepts: Concept[];
  hookTypes: HookType[];
}): WhitespaceSuggestion[] {
  const whitespace: WhitespaceSuggestion[] = [];

  products.forEach((product) => {
    const productConcepts = concepts.filter((c) => c.product_id === product.id);
    const testedHooks = new Set(productConcepts.flatMap((c) => c.hook_types || []));

    const missingHooks = hookTypes.filter((h) => !testedHooks.has(h.id));
    missingHooks.forEach((hook) => {
      whitespace.push({
        product_id: product.id,
        product_name: product.name,
        suggestion_type: 'untested_hook',
        message: `${product.name} has never tested a ${hook.name} hook`,
        hook_id: hook.id,
      });
    });
  });

  return whitespace;
}
