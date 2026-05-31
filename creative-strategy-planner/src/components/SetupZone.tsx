import { useState } from 'react';
import { format } from 'date-fns';
import { IconPlus, IconTrash, IconChevronUp, IconChevronDown, IconGripVertical } from '@tabler/icons-react';
import { useStore } from '../lib/store';
import type { MonthPlan } from '../lib/types';

export default function SetupZone({ month, plan }: { month: string; plan: MonthPlan }) {
  const products = useStore((s) => s.products);
  const creators = useStore((s) => s.creators);
  const setAvailability = useStore((s) => s.setAvailability);
  const addEvent = useStore((s) => s.addEvent);
  const removeEvent = useStore((s) => s.removeEvent);
  const setProductOrder = useStore((s) => s.setProductOrder);

  const weeks = Array.from({ length: plan.weeksInMonth }, (_, i) => i + 1);
  const orderedProducts = [...products].sort(
    (a, b) => plan.productOrder.indexOf(a.id) - plan.productOrder.indexOf(b.id),
  );

  const [showEventForm, setShowEventForm] = useState(false);

  const moveProduct = (id: string, dir: -1 | 1) => {
    const order = [...plan.productOrder];
    const i = order.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    setProductOrder(month, order);
  };

  return (
    <div className="space-y-6">
      {/* Events */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-stone-500">Events</h3>
          <button className="btn" onClick={() => setShowEventForm((v) => !v)}>
            <IconPlus size={16} stroke={1.5} /> Add event
          </button>
        </div>
        {showEventForm && (
          <EventForm
            month={month}
            onAdd={(e) => {
              addEvent(month, e);
              setShowEventForm(false);
            }}
          />
        )}
        <div className="flex gap-3 overflow-x-auto pb-1">
          {plan.events.length === 0 && <p className="text-sm text-stone-400">No events scheduled.</p>}
          {plan.events.map((e) => (
            <div key={e.id} className="card min-w-[220px]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-sm text-stone-500">{format(new Date(e.date), 'MMM d')} · {e.location || '—'}</div>
                </div>
                <button className="text-stone-400 hover:text-red-500" onClick={() => removeEvent(month, e.id)}>
                  <IconTrash size={16} stroke={1.5} />
                </button>
              </div>
              <div className="mt-2 text-xs text-stone-500">
                {e.expected_concepts} concepts · {e.products.length} products
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Creator availability */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-stone-500">Creator availability</h3>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500 dark:border-stone-800">
                <th className="px-4 py-2 font-medium">Creator</th>
                {weeks.map((w) => (
                  <th key={w} className="px-3 py-2 text-center font-medium">W{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creators.map((c) => (
                <tr key={c.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800/50">
                  <td className="px-4 py-2">
                    {c.name} <span className="text-xs text-stone-400">({c.type})</span>
                  </td>
                  {weeks.map((w) => {
                    const val = plan.availability[c.id]?.[w] ?? c.max_weekly_slots;
                    return (
                      <td key={w} className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {val === 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                          <input
                            type="number"
                            min={0}
                            max={c.max_weekly_slots}
                            value={val}
                            onChange={(ev) =>
                              setAvailability(month, c.id, w, Math.max(0, Math.min(c.max_weekly_slots, Number(ev.target.value))))
                            }
                            className="w-12 rounded border border-stone-300 bg-transparent px-1 py-0.5 text-center dark:border-stone-700"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product priorities */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-stone-500">Product priorities</h3>
        <div className="space-y-1.5">
          {orderedProducts.map((p, idx) => (
            <div key={p.id} className="card flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <IconGripVertical size={16} className="text-stone-300" stroke={1.5} />
                <span className="w-5 text-sm text-stone-400">{idx + 1}</span>
                <span className="font-medium">{p.name}</span>
                <span
                  className={`pill ${
                    p.type === 'physical'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  }`}
                >
                  {p.type === 'physical' ? 'Physical' : 'Info'}
                </span>
              </div>
              <div className="flex gap-1">
                <button className="btn px-1.5 py-1" onClick={() => moveProduct(p.id, -1)} disabled={idx === 0}>
                  <IconChevronUp size={14} stroke={1.5} />
                </button>
                <button
                  className="btn px-1.5 py-1"
                  onClick={() => moveProduct(p.id, 1)}
                  disabled={idx === orderedProducts.length - 1}
                >
                  <IconChevronDown size={14} stroke={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EventForm({ month, onAdd }: { month: string; onAdd: (e: Omit<MonthPlan['events'][number], 'id'>) => void }) {
  const products = useStore((s) => s.products);
  const [name, setName] = useState('');
  const [date, setDate] = useState(`${month.slice(0, 8)}15`);
  const [location, setLocation] = useState('');
  const [expected, setExpected] = useState(3);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="card mb-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Name
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Retreat shoot" />
        </label>
        <label className="text-sm">
          Date
          <input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="text-sm">
          Location
          <input className="input mt-1" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Berlin" />
        </label>
        <label className="text-sm">
          Expected concepts
          <input type="number" min={1} className="input mt-1" value={expected} onChange={(e) => setExpected(Number(e.target.value))} />
        </label>
      </div>
      <div>
        <div className="mb-1 text-sm">Products to film</div>
        <div className="flex flex-wrap gap-1.5">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setSelected((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))
              }
              className={`pill border ${
                selected.includes(p.id)
                  ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                  : 'border-stone-300 dark:border-stone-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <button
        className="btn btn-primary"
        disabled={!name || selected.length === 0}
        onClick={() => onAdd({ name, date, location, expected_concepts: expected, products: selected })}
      >
        Add event
      </button>
    </div>
  );
}
