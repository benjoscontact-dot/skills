// Domain types — mirror the Supabase schema shapes but used client-side.

export type ProductType = 'info' | 'physical';
export type CreatorType = 'in-house' | 'event-team' | 'ugc' | 'no-film';
export type ConceptStatus = 'iteration' | 'adjacent' | 'whitespace' | 'net_new';
export type ConceptFormat =
  | 'ugc'
  | 'talking_head'
  | 'vsl'
  | 'static'
  | 'carousel'
  | 'b_roll'
  | 'voiceover'
  | 'love_letter';
export type PlanStatus = 'draft' | 'reviewing' | 'locked' | 'published';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  priority: number;
  active?: boolean;
  notes?: string;
}

export interface Creator {
  id: string;
  name: string;
  type: CreatorType;
  max_weekly_slots: number;
  lead_time_days?: number;
  allowed_products: string[]; // product ids; empty = all
  active?: boolean;
  notes?: string;
}

export interface HookType {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

export interface Concept {
  id: string;
  product_id: string;
  persona: string;
  angle: string;
  format: ConceptFormat;
  hook_types: string[];
  status: ConceptStatus;
  reference_winner_id?: string | null;
  editor_notes?: string;
  last_roas?: number | null;
  last_spend?: number | null;
  active?: boolean;
}

export interface PlanEvent {
  id: string;
  name: string;
  date: string; // ISO date
  location?: string;
  expected_concepts: number;
  products: string[]; // product ids
  notes?: string;
}

export interface PlanSlot {
  id: string;
  week: number;
  creator_id: string;
  concept_id: string;
  concept?: Concept;
  is_backup?: boolean;
  is_event_slot?: boolean;
  position?: number;
}

// availability[creatorId][week] = slots
export type Availability = Record<string, Record<number, number>>;

export interface MonthPlan {
  month: string; // first day of month, e.g. 2026-06-01
  status: PlanStatus;
  slots: PlanSlot[];
  availability: Availability;
  events: PlanEvent[];
  productOrder: string[]; // product ids in priority order
  weeksInMonth: number;
  createdAt: string;
  updatedAt: string;
}
