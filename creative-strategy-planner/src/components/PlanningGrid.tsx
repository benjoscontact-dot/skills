import { useDraggable, useDroppable } from '@dnd-kit/core';
import { IconX } from '@tabler/icons-react';
import { useStore } from '../lib/store';
import type { MonthPlan, PlanSlot, Product } from '../lib/types';
import { conceptCellClasses, productAbbrev, FORMAT_LABELS } from '../lib/ui';

export default function PlanningGrid({ month, plan, onEditSlot }: { month: string; plan: MonthPlan; onEditSlot: (s: PlanSlot) => void }) {
  const creators = useStore((s) => s.creators);
  const products = useStore((s) => s.products);
  const hookTypes = useStore((s) => s.hookTypes);
  const removeSlot = useStore((s) => s.removeSlot);

  const weeks = Array.from({ length: plan.weeksInMonth }, (_, i) => i + 1);
  const productById = (id?: string) => products.find((p) => p.id === id);
  const hookName = (id: string) => hookTypes.find((h) => h.id === id)?.name ?? id;

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[720px] gap-1.5"
        style={{ gridTemplateColumns: `160px repeat(${plan.weeksInMonth}, minmax(0, 1fr))` }}
      >
        {/* header row */}
        <div />
        {weeks.map((w) => (
          <div key={w} className="px-2 py-1 text-center text-sm font-medium text-stone-500">
            Week {w}
          </div>
        ))}

        {creators.map((creator) => (
          <FragmentRow key={creator.id}>
            <div className="flex items-center px-2 py-2 text-sm font-medium">{creator.name}</div>
            {weeks.map((w) => {
              const cellSlots = plan.slots.filter(
                (s) => s.creator_id === creator.id && s.week === w && !s.is_backup,
              );
              return (
                <DroppableCell key={w} id={`cell:${creator.id}:${w}`} empty={cellSlots.length === 0}>
                  {cellSlots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      product={productById(slot.concept?.product_id)}
                      hookName={hookName}
                      onEdit={() => onEditSlot(slot)}
                      onRemove={() => removeSlot(month, slot.id)}
                    />
                  ))}
                </DroppableCell>
              );
            })}
          </FragmentRow>
        ))}
      </div>

      <Legend />
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DroppableCell({ id, empty, children }: { id: string; empty: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[58px] rounded-lg p-1 transition-colors ${
        empty
          ? 'border border-dashed border-stone-300 dark:border-stone-700'
          : 'border border-transparent'
      } ${isOver ? 'ring-2 ring-stone-400' : ''}`}
    >
      {empty ? (
        <div className="flex h-full min-h-[48px] items-center justify-center text-stone-300">—</div>
      ) : (
        <div className="space-y-1">{children}</div>
      )}
    </div>
  );
}

function SlotCard({
  slot,
  product,
  hookName,
  onEdit,
  onRemove,
}: {
  slot: PlanSlot;
  product?: Product;
  hookName: (id: string) => string;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `slot:${slot.id}` });
  const firstHook = slot.concept?.hook_types?.[0];
  const tooltip = slot.concept ? `${slot.concept.persona} · ${slot.concept.angle} · ${FORMAT_LABELS[slot.concept.format]}` : '';

  return (
    <div
      ref={setNodeRef}
      title={tooltip}
      className={`group relative rounded-lg px-2 py-1.5 text-xs ${conceptCellClasses(
        product,
        slot.is_event_slot,
        slot.is_backup,
      )} ${isDragging ? 'opacity-40' : ''}`}
    >
      <button
        className="absolute right-1 top-1 hidden rounded text-stone-500 hover:text-red-600 group-hover:block"
        onClick={onRemove}
        aria-label="Remove"
      >
        <IconX size={13} stroke={1.5} />
      </button>
      <div {...listeners} {...attributes} className="cursor-grab pr-3" onClick={onEdit}>
        <div className="font-medium">{product ? productAbbrev(product.name) : '??'}</div>
        <div className="truncate opacity-80">{firstHook ? hookName(firstHook) : '—'}</div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: 'Info product', cls: 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100' },
    { label: 'Physical product', cls: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' },
    { label: 'Event Team', cls: 'bg-violet-50 text-violet-900 dark:bg-violet-950 dark:text-violet-100' },
    { label: 'No-Film', cls: 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100' },
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className={`h-3 w-3 rounded ${i.cls}`} />
          {i.label}
        </div>
      ))}
    </div>
  );
}
