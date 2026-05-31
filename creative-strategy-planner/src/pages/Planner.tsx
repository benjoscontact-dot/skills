import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { format, addMonths, subMonths } from 'date-fns';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSparkles,
  IconLayoutSidebarLeftExpand,
  IconShare,
  IconRocket,
  IconChevronUp,
  IconChevronDown,
  IconTrash,
} from '@tabler/icons-react';
import { useStore, monthKey } from '../lib/store';
import { validatePlan } from '../lib/autoSuggest';
import type { Concept, PlanSlot, MonthPlan } from '../lib/types';
import SetupZone from '../components/SetupZone';
import PlanningGrid from '../components/PlanningGrid';
import ConceptLibrary from '../components/ConceptLibrary';
import ConceptEditor from '../components/ConceptEditor';
import ValidatorPanel from '../components/ValidatorPanel';
import { conceptCellClasses, productAbbrev } from '../lib/ui';

export default function Planner() {
  const { month: rawMonth } = useParams();
  const navigate = useNavigate();
  const month = monthKey(rawMonth ?? new Date());

  const ensurePlan = useStore((s) => s.ensurePlan);
  const plan = useStore((s) => s.plans[month]);
  const products = useStore((s) => s.products);
  const creators = useStore((s) => s.creators);
  const generate = useStore((s) => s.generate);
  const clearPlan = useStore((s) => s.clearPlan);
  const assignConcept = useStore((s) => s.assignConcept);
  const moveSlot = useStore((s) => s.moveSlot);
  const setBackup = useStore((s) => s.setBackup);
  const setStatus = useStore((s) => s.setStatus);

  const [libOpen, setLibOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(true);
  const [editing, setEditing] = useState<Concept | 'new' | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    ensurePlan(month);
  }, [month, ensurePlan]);

  // Keyboard shortcut: L toggles library
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        setLibOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const notify = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2500);
  };

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const activeId = String(e.active.id);
      const overId = e.over ? String(e.over.id) : null;
      if (!overId) return;

      if (overId.startsWith('cell:')) {
        const [, creatorId, week] = overId.split(':');
        if (activeId.startsWith('lib:')) {
          const ok = assignConcept(month, activeId.slice(4), creatorId, Number(week));
          if (!ok) notify('Cannot place here — creator/product or capacity rule blocked it.');
        } else if (activeId.startsWith('slot:')) {
          moveSlot(month, activeId.slice(5), creatorId, Number(week));
        }
      } else if (overId.startsWith('backup:')) {
        const week = Number(overId.split(':')[1]);
        if (activeId.startsWith('lib:')) setBackup(month, activeId.slice(4), week);
      }
    },
    [month, assignConcept, moveSlot, setBackup],
  );

  if (!plan) return null;

  const v = validatePlan(plan.slots, products);
  const hasProducts = products.length > 0;
  const hasAvailability = creators.some((c) =>
    Object.values(plan.availability[c.id] ?? {}).some((n) => n > 0),
  );
  const weeks = Array.from({ length: plan.weeksInMonth }, (_, i) => i + 1);

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <ConceptLibrary
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onNew={() => setEditing('new')}
        onEdit={(c) => setEditing(c)}
      />

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-stone-50/90 px-6 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
        <div className="flex items-center gap-2">
          <button className="btn px-1.5 py-1" onClick={() => navigate(`/plan/${monthKey(subMonths(new Date(month), 1))}`)}>
            <IconChevronLeft size={16} stroke={1.5} />
          </button>
          <span className="min-w-[140px] text-center text-base font-medium">{format(new Date(month), 'MMMM yyyy')}</span>
          <button className="btn px-1.5 py-1" onClick={() => navigate(`/plan/${monthKey(addMonths(new Date(month), 1))}`)}>
            <IconChevronRight size={16} stroke={1.5} />
          </button>
          <button className="btn ml-2" onClick={() => setLibOpen(true)}>
            <IconLayoutSidebarLeftExpand size={16} stroke={1.5} /> Library <span className="text-xs text-stone-400">(L)</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="pill bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200">
            {v.total} slots planned
          </span>
          <span className={`pill ${v.isValid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'}`}>
            {v.isValid ? 'Strategy valid' : `${v.warnings.length} warnings`}
          </span>
        </div>
      </div>

      {flash && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-stone-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-stone-100 dark:text-stone-900">
          {flash}
        </div>
      )}

      <div className="grid grid-cols-[1fr_300px] gap-6 px-6 py-5 pb-24">
        <div className="space-y-6">
          {/* Setup zone */}
          <div className="card">
            <button className="mb-1 flex w-full items-center justify-between" onClick={() => setSetupOpen((v) => !v)}>
              <span className="text-sm font-medium">Setup</span>
              {setupOpen ? <IconChevronUp size={16} stroke={1.5} /> : <IconChevronDown size={16} stroke={1.5} />}
            </button>
            {setupOpen && (
              <div className="mt-4">
                <SetupZone month={month} plan={plan} />
              </div>
            )}
          </div>

          {/* Generate */}
          <div className="flex items-center gap-2">
            <button
              className="btn btn-primary"
              disabled={!hasProducts || !hasAvailability}
              onClick={() => generate(month)}
            >
              <IconSparkles size={16} stroke={1.5} /> Generate plan
            </button>
            {plan.slots.length > 0 && (
              <button className="btn text-red-600" onClick={() => clearPlan(month)}>
                <IconTrash size={16} stroke={1.5} /> Clear
              </button>
            )}
            {!hasAvailability && <span className="text-xs text-stone-400">Set creator availability first.</span>}
          </div>

          {/* Grid */}
          <div className="card">
            <h3 className="mb-3 text-sm font-medium">Planning grid</h3>
            <PlanningGrid month={month} plan={plan} onEditSlot={(s: PlanSlot) => s.concept && setEditing(s.concept)} />
          </div>

          {/* Backup row */}
          <div className="card">
            <h3 className="mb-3 text-sm font-medium">Backup plan <span className="text-xs font-normal text-stone-400">— swap in if a creator drops out</span></h3>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${plan.weeksInMonth}, minmax(0, 1fr))` }}>
              {weeks.map((w) => (
                <BackupCell key={w} week={w} plan={plan} />
              ))}
            </div>
          </div>
        </div>

        {/* Validator */}
        <ValidatorPanel plan={plan} />
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-end gap-2 border-t border-stone-200 bg-white px-6 py-3 dark:border-stone-800 dark:bg-stone-900">
        <span className="mr-auto text-xs capitalize text-stone-400">Status: {plan.status}</span>
        <button
          className="btn"
          onClick={() => {
            setStatus(month, 'reviewing');
            const token = Math.random().toString(36).slice(2, 10);
            notify(`Review link (demo): ${location.origin}${location.pathname}#/plan/${month}?review=${token}`);
          }}
        >
          <IconShare size={16} stroke={1.5} /> Share for team review
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            setStatus(month, 'locked');
            notify('Pushed to Asana + Notion + Slack (stub) — plan locked.');
          }}
        >
          <IconRocket size={16} stroke={1.5} /> Push to Asana + Notion + Slack
        </button>
      </div>

      <ConceptEditor concept={editing} onClose={() => setEditing(null)} />
    </DndContext>
  );
}

function BackupCell({ week, plan }: { week: number; plan: MonthPlan }) {
  const products = useStore((s) => s.products);
  const removeSlot = useStore((s) => s.removeSlot);
  const { setNodeRef, isOver } = useDroppable({ id: `backup:${week}` });
  const slot = plan.slots.find((s) => s.is_backup && s.week === week);
  const product = products.find((p) => p.id === slot?.concept?.product_id);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[58px] rounded-lg p-1 ${
        slot ? '' : 'border border-dashed border-stone-300 dark:border-stone-700'
      } ${isOver ? 'ring-2 ring-stone-400' : ''}`}
    >
      <div className="mb-1 text-center text-[11px] text-stone-400">Week {week}</div>
      {slot ? (
        <div className={`group relative rounded-lg px-2 py-1.5 text-xs ${conceptCellClasses(product, false, true)}`}>
          <button
            className="absolute right-1 top-1 hidden text-stone-500 hover:text-red-600 group-hover:block"
            onClick={() => removeSlot(plan.month, slot.id)}
          >
            ×
          </button>
          <div className="font-medium">{product ? productAbbrev(product.name) : '??'}</div>
          <div className="truncate opacity-80">{slot.concept?.angle}</div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-2 text-stone-300">—</div>
      )}
    </div>
  );
}
