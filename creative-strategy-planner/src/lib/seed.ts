import type { Product, Creator, HookType, Concept } from './types';

// Stable ids so seed concepts can reference seed products/creators.
const pid = (s: string) => `prod_${s}`;
const cid = (s: string) => `crea_${s}`;

export const SEED_PRODUCTS: Product[] = [
  { id: pid('schlafkurs'), name: 'Schlafkurs', type: 'info', priority: 1 },
  { id: pid('pilates'), name: 'Pilates Kurs', type: 'info', priority: 2 },
  { id: pid('running'), name: 'Running Kurs', type: 'info', priority: 3 },
  { id: pid('menopause'), name: 'Menopause Kurs', type: 'info', priority: 4 },
  { id: pid('kinderschlaf'), name: 'Kinderschlaf', type: 'info', priority: 5 },
  { id: pid('faszien'), name: 'Faszien Training', type: 'info', priority: 5 },
  { id: pid('praevention'), name: 'Präventionskurs', type: 'info', priority: 5 },
  { id: pid('kissen'), name: 'Blackroll Kissen', type: 'physical', priority: 1 },
  { id: pid('boots'), name: 'Blackroll Boots', type: 'physical', priority: 1 },
  { id: pid('sommerdecke'), name: 'Sommerdecke', type: 'physical', priority: 2 },
  { id: pid('matratze'), name: 'Base Matratze', type: 'physical', priority: 3 },
];

const allProducts = SEED_PRODUCTS.map((p) => p.id);
const infoProducts = SEED_PRODUCTS.filter((p) => p.type === 'info').map((p) => p.id);

export const SEED_CREATORS: Creator[] = [
  {
    id: cid('stefan'),
    name: 'Stefan',
    type: 'in-house',
    max_weekly_slots: 3,
    lead_time_days: 5,
    allowed_products: [...infoProducts, pid('kissen'), pid('boots'), pid('sommerdecke')],
    notes: 'Highest capacity, info + physical mix',
  },
  {
    id: cid('leona'),
    name: 'Leona',
    type: 'in-house',
    max_weekly_slots: 2,
    lead_time_days: 5,
    allowed_products: [...infoProducts, pid('kissen'), pid('boots')],
    notes: 'Mid capacity, info + physical mix',
  },
  {
    id: cid('conrad'),
    name: 'Conrad',
    type: 'in-house',
    max_weekly_slots: 1,
    lead_time_days: 10,
    allowed_products: [pid('schlafkurs'), pid('pilates'), pid('kissen')],
    notes: 'Limited slots, ~1 per 1–2 weeks',
  },
  {
    id: cid('event'),
    name: 'Event Team',
    type: 'event-team',
    max_weekly_slots: 3,
    lead_time_days: 14,
    allowed_products: allProducts,
    notes: '~3 concepts every 3 weeks at events',
  },
  {
    id: cid('katrin'),
    name: 'UGC Katrin',
    type: 'ugc',
    max_weekly_slots: 1,
    lead_time_days: 7,
    allowed_products: allProducts,
    notes: 'Info OR physical, 1 per week',
  },
  {
    id: cid('laura'),
    name: 'UGC Laura',
    type: 'ugc',
    max_weekly_slots: 2,
    lead_time_days: 7,
    allowed_products: allProducts,
    notes: 'Info OR physical, 2 per week',
  },
  {
    id: cid('ugcnew'),
    name: 'UGC New',
    type: 'ugc',
    max_weekly_slots: 1,
    lead_time_days: 10,
    allowed_products: infoProducts,
    notes: 'Onboarding, info only initially',
  },
  {
    id: cid('nofilm'),
    name: 'No-Film',
    type: 'no-film',
    max_weekly_slots: 1,
    lead_time_days: 1,
    allowed_products: allProducts,
    notes: 'Love Letter / B-Roll / Voiceover pool',
  },
];

export const SEED_HOOK_TYPES: HookType[] = [
  { id: 'problem_agitation', name: 'Problem Agitation', description: 'Lead with pain the viewer already feels', display_order: 1 },
  { id: 'contrarian_truth', name: 'Contrarian Truth', description: 'Challenge a common assumption', display_order: 2 },
  { id: 'specific_proof', name: 'Specific Proof', description: 'Lead with measurable outcome / numbers', display_order: 3 },
  { id: 'curiosity_gap', name: 'Curiosity Gap', description: 'Open an info gap only watching closes', display_order: 4 },
  { id: 'truth_bomb', name: 'Truth Bomb', description: 'Uncomfortable honesty about price / industry', display_order: 5 },
  { id: 'psychological_confrontation', name: 'Psychological Confrontation', description: 'Direct callout that feels like a friend', display_order: 6 },
  { id: 'sensory_asmr', name: 'Sensory / ASMR', description: 'Texture, sound, no words for 2–3s', display_order: 7 },
  { id: 'founders_letter', name: 'Founder Letter', description: 'Origin story with high stakes', display_order: 8 },
  { id: 'social_proof', name: 'Social Proof', description: 'Credibility marker, X% of customers', display_order: 9 },
];

const HOOK_IDS = SEED_HOOK_TYPES.map((h) => h.id);

// ------------------------------------------------------------------
// Seed concepts — enough variety for the generator to produce a full
// month and for the validator to pass. Generated deterministically.
// ------------------------------------------------------------------

const PERSONAS = [
  'Stressed parent, 35–45',
  'Burned-out professional',
  'Peri-menopausal woman, 45+',
  'Weekend warrior runner',
  'Chronic back-pain sufferer',
  'Sleep-deprived new mom',
  'Desk worker with tight hips',
  'Biohacker optimizing recovery',
];

const ANGLES = [
  'Sleep without pills',
  'Fix it in 10 minutes a day',
  'The science they never told you',
  'What doctors miss',
  'Recover faster than you think',
  'Stop the 3am wake-ups',
  'Move pain-free again',
  'Energy back in two weeks',
];

const STATUSES: Concept['status'][] = ['iteration', 'iteration', 'adjacent', 'net_new', 'whitespace'];
const FORMATS: Concept['format'][] = ['ugc', 'talking_head', 'vsl', 'static', 'carousel', 'b_roll', 'voiceover', 'love_letter'];

function makeConcepts(): Concept[] {
  const concepts: Concept[] = [];
  let n = 0;
  SEED_PRODUCTS.forEach((product, pIdx) => {
    // 4 concepts per product
    for (let i = 0; i < 4; i++) {
      const seed = pIdx * 7 + i * 3;
      const status = STATUSES[seed % STATUSES.length];
      const format = FORMATS[seed % FORMATS.length];
      const hookCount = 4 + (seed % 2); // 4 or 5 hooks
      const hooks: string[] = [];
      for (let h = 0; h < hookCount; h++) {
        hooks.push(HOOK_IDS[(seed + h) % HOOK_IDS.length]);
      }
      const roas = status === 'iteration' ? 3 + ((seed % 5) * 0.4) : status === 'adjacent' ? 2 + (seed % 3) * 0.3 : null;
      concepts.push({
        id: `conc_${n++}`,
        product_id: product.id,
        persona: PERSONAS[(seed) % PERSONAS.length],
        angle: ANGLES[(seed + 2) % ANGLES.length],
        format,
        hook_types: Array.from(new Set(hooks)),
        status,
        last_roas: roas,
        last_spend: roas ? 1500 + (seed % 6) * 500 : null,
        active: true,
      });
    }
  });
  return concepts;
}

export const SEED_CONCEPTS: Concept[] = makeConcepts();
