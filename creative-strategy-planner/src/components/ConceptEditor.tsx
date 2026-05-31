import { useEffect, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useStore, newConceptId } from '../lib/store';
import type { Concept, ConceptFormat, ConceptStatus } from '../lib/types';
import { FORMAT_LABELS, STATUS_LABELS } from '../lib/ui';

const FORMATS: ConceptFormat[] = ['ugc', 'talking_head', 'vsl', 'static', 'carousel', 'b_roll', 'voiceover', 'love_letter'];
const STATUSES: ConceptStatus[] = ['iteration', 'adjacent', 'whitespace', 'net_new'];

function blank(productId: string): Concept {
  return {
    id: newConceptId(),
    product_id: productId,
    persona: '',
    angle: '',
    format: 'ugc',
    hook_types: [],
    status: 'net_new',
    last_roas: null,
    active: true,
  };
}

export default function ConceptEditor({ concept, onClose }: { concept: Concept | 'new' | null; onClose: () => void }) {
  const products = useStore((s) => s.products);
  const concepts = useStore((s) => s.concepts);
  const hookTypes = useStore((s) => s.hookTypes);
  const upsertConcept = useStore((s) => s.upsertConcept);
  const deleteConcept = useStore((s) => s.deleteConcept);

  const [draft, setDraft] = useState<Concept | null>(null);

  useEffect(() => {
    if (concept === 'new') setDraft(blank(products[0]?.id ?? ''));
    else if (concept) setDraft({ ...concept });
    else setDraft(null);
  }, [concept, products]);

  if (!draft) return null;

  const update = (patch: Partial<Concept>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const toggleHook = (id: string) =>
    update({ hook_types: draft.hook_types.includes(id) ? draft.hook_types.filter((h) => h !== id) : [...draft.hook_types, id] });

  const winners = concepts.filter((c) => (c.last_roas ?? 0) > 3 && c.id !== draft.id);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col border-l border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
          <h2 className="text-sm font-medium">{concept === 'new' ? 'New concept' : 'Edit concept'}</h2>
          <button className="btn px-1.5 py-1" onClick={onClose}>
            <IconX size={16} stroke={1.5} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <label className="block text-sm">
            Product
            <select className="input mt-1" value={draft.product_id} onChange={(e) => update({ product_id: e.target.value })}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Persona
            <input
              className="input mt-1"
              list="persona-list"
              value={draft.persona}
              onChange={(e) => update({ persona: e.target.value })}
            />
            <datalist id="persona-list">
              {[...new Set(concepts.filter((c) => c.product_id === draft.product_id).map((c) => c.persona))].map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>

          <label className="block text-sm">
            Angle
            <input
              className="input mt-1"
              list="angle-list"
              value={draft.angle}
              onChange={(e) => update({ angle: e.target.value })}
            />
            <datalist id="angle-list">
              {[...new Set(concepts.filter((c) => c.product_id === draft.product_id).map((c) => c.angle))].map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </label>

          <div className="text-sm">
            Format
            <div className="mt-1 flex flex-wrap gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => update({ format: f })}
                  className={`pill border ${
                    draft.format === f
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                      : 'border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {FORMAT_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm">
            Hook types
            <p className="text-xs text-stone-400">Pick 4–5 hooks to test on this single video</p>
            <div className="mt-1 space-y-1">
              {hookTypes.map((h) => (
                <label key={h.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.hook_types.includes(h.id)} onChange={() => toggleHook(h.id)} />
                  {h.name}
                </label>
              ))}
            </div>
          </div>

          <div className="text-sm">
            Status
            <div className="mt-1 flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => update({ status: s })}
                  className={`pill border ${
                    draft.status === s
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                      : 'border-stone-300 dark:border-stone-700'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {draft.status === 'iteration' && (
            <label className="block text-sm">
              Reference winner
              <select
                className="input mt-1"
                value={draft.reference_winner_id ?? ''}
                onChange={(e) => update({ reference_winner_id: e.target.value || null })}
              >
                <option value="">None</option>
                {winners.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.angle} (ROAS {w.last_roas?.toFixed(1)})
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm">
            Last ROAS
            <input
              type="number"
              step="0.1"
              className="input mt-1"
              value={draft.last_roas ?? ''}
              onChange={(e) => update({ last_roas: e.target.value === '' ? null : Number(e.target.value) })}
            />
          </label>

          <label className="block text-sm">
            Editor notes
            <textarea
              className="input mt-1 h-24 resize-none"
              value={draft.editor_notes ?? ''}
              onChange={(e) => update({ editor_notes: e.target.value })}
            />
          </label>
        </div>

        <div className="flex gap-2 border-t border-stone-200 p-4 dark:border-stone-800">
          <button
            className="btn btn-primary"
            disabled={!draft.persona || !draft.angle}
            onClick={() => {
              upsertConcept(draft);
              onClose();
            }}
          >
            Save
          </button>
          <button
            className="btn"
            onClick={() => {
              upsertConcept({ ...draft, id: newConceptId() });
              onClose();
            }}
          >
            Duplicate
          </button>
          {concept !== 'new' && (
            <button
              className="btn ml-auto text-red-600"
              onClick={() => {
                deleteConcept(draft.id);
                onClose();
              }}
            >
              Delete
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
