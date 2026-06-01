// Roster — the stable inputs that rarely change.
// Edit names here so they match your Asana / Slack exactly.
//
// Product priority: 1 = highest (gets the most slots), 5 = lowest.
// Creator `filmsInfo` / `filmsPhysical` gate what they can be assigned.
// `only` (optional) restricts a creator to a specific list of product names.

export const PRODUCTS = [
  { name: 'Schlafkurs',        type: 'info',     priority: 1 },
  { name: 'Pilates Kurs',      type: 'info',     priority: 2 },
  { name: 'Running Kurs',      type: 'info',     priority: 3 },
  { name: 'Menopause Kurs',    type: 'info',     priority: 4 },
  { name: 'Kinderschlaf',      type: 'info',     priority: 5 },
  { name: 'Faszien Training',  type: 'info',     priority: 5 },
  { name: 'Präventionskurs',   type: 'info',     priority: 5 },
  { name: 'Blackroll Kissen',  type: 'physical', priority: 1 },
  { name: 'Blackroll Boots',   type: 'physical', priority: 1 },
  { name: 'Sommerdecke',       type: 'physical', priority: 2 },
  { name: 'Base Matratze',     type: 'physical', priority: 3 },
];

// maxPerWeek = filming capacity per week.
// Event team only has capacity in weeks that have an event (see config).
export const CREATORS = [
  { name: 'Stefan',     kind: 'in-house',   maxPerWeek: 3, filmsInfo: true,  filmsPhysical: true,
    only: ['Schlafkurs','Pilates Kurs','Running Kurs','Menopause Kurs','Kinderschlaf','Faszien Training','Präventionskurs','Blackroll Kissen','Blackroll Boots','Sommerdecke'] },
  { name: 'Leona',      kind: 'in-house',   maxPerWeek: 2, filmsInfo: true,  filmsPhysical: true,
    only: ['Schlafkurs','Pilates Kurs','Running Kurs','Menopause Kurs','Kinderschlaf','Faszien Training','Präventionskurs','Blackroll Kissen','Blackroll Boots'] },
  { name: 'Conrad',     kind: 'in-house',   maxPerWeek: 1, filmsInfo: true,  filmsPhysical: true,
    only: ['Schlafkurs','Pilates Kurs','Blackroll Kissen'] },
  { name: 'Event Team', kind: 'event-team', maxPerWeek: 3, filmsInfo: true,  filmsPhysical: true, eventOnly: true },
  { name: 'UGC Katrin', kind: 'ugc',        maxPerWeek: 1, filmsInfo: true,  filmsPhysical: true },
  { name: 'UGC Laura',  kind: 'ugc',        maxPerWeek: 2, filmsInfo: true,  filmsPhysical: true },
  { name: 'UGC New',    kind: 'ugc',        maxPerWeek: 1, filmsInfo: true,  filmsPhysical: false },
];

// Weekly production target (what YOU strategize each week).
export const WEEKLY_TARGET = { info: 3, physical: 4 };

// The 9 hooks from your framework.
export const HOOKS = [
  'Problem Agitation',
  'Contrarian Truth',
  'Specific Proof',
  'Curiosity Gap',
  'Truth Bomb',
  'Psychological Confrontation',
  'Sensory / ASMR',
  'Founder Letter',
  'Social Proof',
];

// Formats each creator kind can shoot — rotated for variety.
export const FORMATS_BY_KIND = {
  'in-house':   ['Talking Head', 'VSL', 'Static'],
  'ugc':        ['UGC'],
  'event-team': ['UGC', 'Talking Head'],
};
