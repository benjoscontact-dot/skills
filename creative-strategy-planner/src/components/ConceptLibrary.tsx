import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { IconX, IconPlus, IconSearch, IconGripVertical } from '@tabler/icons-react';
import { useStore } from '../lib/store';
import { computeWhitespace } from '../lib/autoSuggest';
import type { Concept } from '../lib/types';
import { STATUS_LABELS, FORMAT_LABELS } from '../lib/ui';

type Tab = 'iteration' | 'adjacent' | 'whitespace' | 'net_new';
const TABS: Tab[] = ['iteration', 'adjacent', 'whitespace', 'net_new'];

export default function ConceptLibrary({
  open,
  onClose,
  onNew,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  onEdit: (c: Concept) => void;
}) {
  const concepts = useStore((s) => s.concepts);
  const products = useStore((s) => s.products);
  const hookTypes = useStore((s) => s.hookTypes);
  const [tab, setTab] = useState<Tab>('iteration');
  const [query, setQuery] = useState('');

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? '—';

  const filterByTab = (c: Concept) => {
    if (tab === 'iteration') return c.status === 'iteration' || (c.last_roas ?? 0) >= 3;
    if (tab === 'adjacent') return c.status === 'adjacent';
    if (tab === 'net_new') return c.status === 'net_new';
    return false; // whitespace handled separately
  };

  const q = query.toLowerCase();
  const matchesQuery = (c: Concept) =>
    !q ||
    productName(c.product_id).toLowerCase().includes(q) ||
    c.persona.toLowerCase().includes(q) ||
    c.angle.toLowerCase().includes(q);

  const visible = concepts.filter((c) => c.active !== false && filterByTab(c) && matchesQuery(c));
  const whitespace = computeWhitespace({ products, concepts, hookTypes });

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/20" onClick={onClose} />}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-[360px] flex-col border-r border-stone-200 bg-white transition-transform dark:border-stone-800 dark:bg-stone-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-sm font-medium">Concept library</h2>
          <button className="btn px-1.5 py-1" onClick={onClose}>
            <IconX size={16} stroke={1.5} />
          </button>
        </div>

        <div className="flex border-b border-stone-200 dark:border-stone-800">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-2 py-2 text-xs font-medium capitalize ${
                tab === t ? 'border-b-2 border-stone-900 dark:border-stone-100' : 'text-stone-500'
              }`}
            >
              {STATUS_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="border-b border-stone-200 p-3 dark:border-stone-800">
          <div className="relative">
            <IconSearch size={15} className="absolute left-2.5 top-2.5 text-stone-400" stroke={1.5} />
            <input
              className="input pl-8"
              placeholder="Filter by product, persona, angle"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {tab === 'whitespace' ? (
            whitespace.length === 0 ? (
              <p className="text-sm text-stone-400">Every product has tested all hook types. Nice.</p>
            ) : (
              whitespace.slice(0, 40).map((w, i) => (
                <div key={i} className="card py-2 text-sm">
                  {w.message}
                </div>
              ))
            )
          ) : visible.length === 0 ? (
            <p className="text-sm text-stone-400">No concepts in this tab.</p>
          ) : (
            visible.map((c) => (
              <ConceptCard key={c.id} concept={c} productName={productName(c.product_id)} onEdit={() => onEdit(c)} />
            ))
          )}
        </div>

        <div className="border-t border-stone-200 p-3 dark:border-stone-800">
          <button className="btn w-full justify-center" onClick={onNew}>
            <IconPlus size={16} stroke={1.5} /> New concept
          </button>
        </div>
      </aside>
    </>
  );
}

function ConceptCard({ concept, productName, onEdit }: { concept: Concept; productName: string; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `lib:${concept.id}` });
  return (
    <div className={`card py-2.5 ${isDragging ? 'opacity-40' : ''}`}>
      <div className="flex items-start gap-2">
        <button {...listeners} {...attributes} className="mt-0.5 cursor-grab text-stone-300" aria-label="Drag">
          <IconGripVertical size={16} stroke={1.5} />
        </button>
        <div className="min-w-0 flex-1 cursor-pointer" onClick={onEdit}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{productName}</span>
            {concept.last_roas != null && (
              <span className="pill bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                ROAS {concept.last_roas.toFixed(1)}
              </span>
            )}
          </div>
          <div className="truncate text-xs text-stone-500">{concept.persona}</div>
          <div className="truncate text-xs text-stone-500">{concept.angle}</div>
          <div className="mt-1 flex gap-1.5 text-[11px] text-stone-400">
            <span>{STATUS_LABELS[concept.status]}</span>
            <span>·</span>
            <span>{FORMAT_LABELS[concept.format]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
