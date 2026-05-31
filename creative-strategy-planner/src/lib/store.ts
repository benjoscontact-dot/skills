import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfMonth, getWeeksInMonth, format } from 'date-fns';
import type { Product, Creator, HookType, Concept, MonthPlan, PlanSlot, Availability } from './types';
import { SEED_PRODUCTS, SEED_CREATORS, SEED_HOOK_TYPES, SEED_CONCEPTS } from './seed';
import { generatePlan } from './autoSuggest';

const uid = () => Math.random().toString(36).slice(2, 10);

export const monthKey = (d: Date | string) =>
  format(startOfMonth(typeof d === 'string' ? new Date(d) : d), 'yyyy-MM-dd');

function defaultAvailability(creators: Creator[], weeks: number): Availability {
  const a: Availability = {};
  creators.forEach((c) => {
    a[c.id] = {};
    for (let w = 1; w <= weeks; w++) a[c.id][w] = c.max_weekly_slots;
  });
  return a;
}

function emptyPlan(month: string, creators: Creator[], products: Product[]): MonthPlan {
  const weeksInMonth = Math.min(getWeeksInMonth(new Date(month)), 5);
  return {
    month,
    status: 'draft',
    slots: [],
    availability: defaultAvailability(creators, weeksInMonth),
    events: [],
    productOrder: [...products].sort((a, b) => a.priority - b.priority).map((p) => p.id),
    weeksInMonth,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

interface State {
  products: Product[];
  creators: Creator[];
  hookTypes: HookType[];
  concepts: Concept[];
  plans: Record<string, MonthPlan>;

  // selectors / helpers
  getPlan: (month: string) => MonthPlan;
  ensurePlan: (month: string) => void;

  // plan mutations
  generate: (month: string) => void;
  clearPlan: (month: string) => void;
  setAvailability: (month: string, creatorId: string, week: number, value: number) => void;
  assignConcept: (month: string, conceptId: string, creatorId: string, week: number) => boolean;
  moveSlot: (month: string, slotId: string, creatorId: string, week: number) => void;
  removeSlot: (month: string, slotId: string) => void;
  setBackup: (month: string, conceptId: string, week: number) => void;
  setProductOrder: (month: string, order: string[]) => void;
  addEvent: (month: string, e: Omit<MonthPlan['events'][number], 'id'>) => void;
  removeEvent: (month: string, id: string) => void;
  setStatus: (month: string, status: MonthPlan['status']) => void;

  // library mutations
  upsertConcept: (c: Concept) => void;
  deleteConcept: (id: string) => void;

  // settings mutations
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  upsertCreator: (c: Creator) => void;
  deleteCreator: (id: string) => void;

  resetAll: () => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      products: SEED_PRODUCTS,
      creators: SEED_CREATORS,
      hookTypes: SEED_HOOK_TYPES,
      concepts: SEED_CONCEPTS,
      plans: {},

      getPlan: (month) => {
        const key = monthKey(month);
        return get().plans[key] ?? emptyPlan(key, get().creators, get().products);
      },

      ensurePlan: (month) => {
        const key = monthKey(month);
        if (get().plans[key]) return;
        set((s) => ({ plans: { ...s.plans, [key]: emptyPlan(key, s.creators, s.products) } }));
      },

      generate: (month) => {
        const key = monthKey(month);
        const { creators, products, concepts } = get();
        const plan = get().getPlan(key);
        const generated = generatePlan({
          products: [...products].sort(
            (a, b) => plan.productOrder.indexOf(a.id) - plan.productOrder.indexOf(b.id),
          ),
          creators,
          concepts,
          events: plan.events,
          availability: plan.availability,
          weeksInMonth: plan.weeksInMonth,
        });
        const slots: PlanSlot[] = generated.map((g) => ({ ...g, id: uid() }));
        set((s) => ({
          plans: { ...s.plans, [key]: { ...plan, slots, updatedAt: new Date().toISOString() } },
        }));
      },

      clearPlan: (month) => {
        const key = monthKey(month);
        const plan = get().getPlan(key);
        set((s) => ({ plans: { ...s.plans, [key]: { ...plan, slots: [], updatedAt: new Date().toISOString() } } }));
      },

      setAvailability: (month, creatorId, week, value) => {
        const key = monthKey(month);
        const plan = get().getPlan(key);
        const availability = { ...plan.availability, [creatorId]: { ...plan.availability[creatorId], [week]: value } };
        set((s) => ({ plans: { ...s.plans, [key]: { ...plan, availability, updatedAt: new Date().toISOString() } } }));
      },

      assignConcept: (month, conceptId, creatorId, week) => {
        const key = monthKey(month);
        const { creators, concepts } = get();
        const plan = get().getPlan(key);
        const creator = creators.find((c) => c.id === creatorId);
        const concept = concepts.find((c) => c.id === conceptId);
        if (!creator || !concept) return false;

        // Allowed-products guard
        if (creator.allowed_products?.length && !creator.allowed_products.includes(concept.product_id)) {
          return false;
        }
        // Capacity guard (event team allows multiple; others use availability)
        const cap = plan.availability[creatorId]?.[week] ?? creator.max_weekly_slots;
        const used = plan.slots.filter((s) => s.creator_id === creatorId && s.week === week && !s.is_backup).length;
        if (creator.type !== 'event-team' && used >= cap) return false;

        const slot: PlanSlot = {
          id: uid(),
          week,
          creator_id: creatorId,
          concept_id: conceptId,
          concept,
          is_event_slot: creator.type === 'event-team',
          position: used,
        };
        set((s) => ({
          plans: { ...s.plans, [key]: { ...plan, slots: [...plan.slots, slot], updatedAt: new Date().toISOString() } },
        }));
        return true;
      },

      moveSlot: (month, slotId, creatorId, week) => {
        const key = monthKey(month);
        const { creators } = get();
        const plan = get().getPlan(key);
        const creator = creators.find((c) => c.id === creatorId);
        const slot = plan.slots.find((s) => s.id === slotId);
        if (!creator || !slot) return;
        if (creator.allowed_products?.length && slot.concept && !creator.allowed_products.includes(slot.concept.product_id)) {
          return;
        }
        const slots = plan.slots.map((s) =>
          s.id === slotId ? { ...s, creator_id: creatorId, week, is_event_slot: creator.type === 'event-team' } : s,
        );
        set((st) => ({ plans: { ...st.plans, [key]: { ...plan, slots, updatedAt: new Date().toISOString() } } }));
      },

      removeSlot: (month, slotId) => {
        const key = monthKey(month);
        const plan = get().getPlan(key);
        set((s) => ({
          plans: {
            ...s.plans,
            [key]: { ...plan, slots: plan.slots.filter((sl) => sl.id !== slotId), updatedAt: new Date().toISOString() },
          },
        }));
      },

      setBackup: (month, conceptId, week) => {
        const key = monthKey(month);
        const { concepts, creators } = get();
        const plan = get().getPlan(key);
        const concept = concepts.find((c) => c.id === conceptId);
        const noFilm = creators.find((c) => c.type === 'no-film');
        if (!concept || !noFilm) return;
        const slots = plan.slots.filter((s) => !(s.is_backup && s.week === week));
        slots.push({ id: uid(), week, creator_id: noFilm.id, concept_id: conceptId, concept, is_backup: true });
        set((s) => ({ plans: { ...s.plans, [key]: { ...plan, slots, updatedAt: new Date().toISOString() } } }));
      },

      setProductOrder: (month, order) => {
        const key = monthKey(month);
        const plan = get().getPlan(key);
        set((s) => ({ plans: { ...s.plans, [key]: { ...plan, productOrder: order, updatedAt: new Date().toISOString() } } }));
      },

      addEvent: (month, e) => {
        const key = monthKey(month);
        const plan = get().getPlan(key);
        const events = [...plan.events, { ...e, id: uid() }];
        set((s) => ({ plans: { ...s.plans, [key]: { ...plan, events, updatedAt: new Date().toISOString() } } }));
      },

      removeEvent: (month, id) => {
        const key = monthKey(month);
        const plan = get().getPlan(key);
        set((s) => ({
          plans: { ...s.plans, [key]: { ...plan, events: plan.events.filter((e) => e.id !== id), updatedAt: new Date().toISOString() } },
        }));
      },

      setStatus: (month, status) => {
        const key = monthKey(month);
        const plan = get().getPlan(key);
        set((s) => ({ plans: { ...s.plans, [key]: { ...plan, status, updatedAt: new Date().toISOString() } } }));
      },

      upsertConcept: (c) =>
        set((s) => {
          const exists = s.concepts.some((x) => x.id === c.id);
          return { concepts: exists ? s.concepts.map((x) => (x.id === c.id ? c : x)) : [...s.concepts, c] };
        }),
      deleteConcept: (id) => set((s) => ({ concepts: s.concepts.filter((c) => c.id !== id) })),

      upsertProduct: (p) =>
        set((s) => {
          const exists = s.products.some((x) => x.id === p.id);
          return { products: exists ? s.products.map((x) => (x.id === p.id ? p : x)) : [...s.products, p] };
        }),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      upsertCreator: (c) =>
        set((s) => {
          const exists = s.creators.some((x) => x.id === c.id);
          return { creators: exists ? s.creators.map((x) => (x.id === c.id ? c : x)) : [...s.creators, c] };
        }),
      deleteCreator: (id) => set((s) => ({ creators: s.creators.filter((c) => c.id !== id) })),

      resetAll: () =>
        set({
          products: SEED_PRODUCTS,
          creators: SEED_CREATORS,
          hookTypes: SEED_HOOK_TYPES,
          concepts: SEED_CONCEPTS,
          plans: {},
        }),
    }),
    { name: 'csp-store-v1' },
  ),
);

export const newConceptId = uid;
