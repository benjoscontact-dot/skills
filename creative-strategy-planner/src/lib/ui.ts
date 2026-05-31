import type { Product, Concept, MonthPlan } from './types';

// Product-type color coding from the brief.
export function conceptCellClasses(product?: Product, isEvent?: boolean, isBackup?: boolean): string {
  if (isBackup) return 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100';
  if (isEvent) return 'bg-violet-50 text-violet-900 dark:bg-violet-950 dark:text-violet-100';
  if (product?.type === 'physical') return 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100';
  return 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100';
}

export function statusPillClasses(status: MonthPlan['status']): string {
  switch (status) {
    case 'published':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
    case 'locked':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'reviewing':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    default:
      return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200';
  }
}

export function productAbbrev(name: string): string {
  const words = name.split(' ');
  if (words.length === 1) return name.slice(0, 4);
  return words.map((w) => w[0]).join('').toUpperCase().slice(0, 4);
}

export const FORMAT_LABELS: Record<Concept['format'], string> = {
  ugc: 'UGC',
  talking_head: 'Talking Head',
  vsl: 'VSL',
  static: 'Static',
  carousel: 'Carousel',
  b_roll: 'B-Roll',
  voiceover: 'Voiceover',
  love_letter: 'Love Letter',
};

export const STATUS_LABELS: Record<Concept['status'], string> = {
  iteration: 'Iteration',
  adjacent: 'Adjacent',
  whitespace: 'Whitespace',
  net_new: 'Net New',
};
