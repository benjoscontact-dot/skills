import { useState } from 'react';
import { IconTrash, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useStore, newConceptId } from '../lib/store';
import type { Product, Creator } from '../lib/types';

export default function Settings() {
  const products = useStore((s) => s.products);
  const creators = useStore((s) => s.creators);
  const hookTypes = useStore((s) => s.hookTypes);
  const upsertProduct = useStore((s) => s.upsertProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const upsertCreator = useStore((s) => s.upsertCreator);
  const deleteCreator = useStore((s) => s.deleteCreator);
  const resetAll = useStore((s) => s.resetAll);

  const addProduct = () =>
    upsertProduct({ id: newConceptId(), name: 'New product', type: 'info', priority: 5, active: true });
  const addCreator = () =>
    upsertCreator({ id: newConceptId(), name: 'New creator', type: 'ugc', max_weekly_slots: 1, allowed_products: [], active: true });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Settings</h1>
        <button
          className="btn"
          onClick={() => {
            if (confirm('Reset all products, creators, concepts and plans to seed data?')) resetAll();
          }}
        >
          <IconRefresh size={16} stroke={1.5} /> Reset to seed data
        </button>
      </div>

      {/* Products */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-500">Products</h2>
          <button className="btn" onClick={addProduct}>
            <IconPlus size={16} stroke={1.5} /> Add product
          </button>
        </div>
        <div className="card space-y-2 p-3">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onSave={upsertProduct} onDelete={() => deleteProduct(p.id)} />
          ))}
        </div>
      </section>

      {/* Creators */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-stone-500">Creators</h2>
          <button className="btn" onClick={addCreator}>
            <IconPlus size={16} stroke={1.5} /> Add creator
          </button>
        </div>
        <div className="card space-y-2 p-3">
          {creators.map((c) => (
            <CreatorRow key={c.id} creator={c} products={products} onSave={upsertCreator} onDelete={() => deleteCreator(c.id)} />
          ))}
        </div>
      </section>

      {/* Hook types */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-stone-500">Hook types (reference)</h2>
        <div className="card space-y-1.5 p-3">
          {hookTypes.map((h) => (
            <div key={h.id} className="flex justify-between text-sm">
              <span className="font-medium">{h.name}</span>
              <span className="text-stone-400">{h.description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section>
        <h2 className="mb-2 text-sm font-medium text-stone-500">Integrations</h2>
        <div className="card space-y-3 p-4">
          <p className="text-sm text-stone-500">
            Placeholders for v1. In a Supabase build these map to <code>sync-asana</code>, <code>sync-notion</code> and{' '}
            <code>notify-slack</code> edge functions.
          </p>
          {['Asana API key', 'Notion API key', 'Slack webhook'].map((label) => (
            <label key={label} className="block text-sm">
              {label}
              <input className="input mt-1" placeholder="Not connected" disabled />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductRow({ product, onSave, onDelete }: { product: Product; onSave: (p: Product) => void; onDelete: () => void }) {
  const [p, setP] = useState(product);
  const save = (patch: Partial<Product>) => {
    const next = { ...p, ...patch };
    setP(next);
    onSave(next);
  };
  return (
    <div className="flex items-center gap-2">
      <input className="input flex-1" value={p.name} onChange={(e) => save({ name: e.target.value })} />
      <select className="input w-28" value={p.type} onChange={(e) => save({ type: e.target.value as Product['type'] })}>
        <option value="info">Info</option>
        <option value="physical">Physical</option>
      </select>
      <input
        type="number"
        min={1}
        max={5}
        className="input w-20"
        value={p.priority}
        onChange={(e) => save({ priority: Number(e.target.value) })}
      />
      <button className="btn px-1.5 text-red-600" onClick={onDelete}>
        <IconTrash size={15} stroke={1.5} />
      </button>
    </div>
  );
}

function CreatorRow({
  creator,
  products,
  onSave,
  onDelete,
}: {
  creator: Creator;
  products: Product[];
  onSave: (c: Creator) => void;
  onDelete: () => void;
}) {
  const [c, setC] = useState(creator);
  const save = (patch: Partial<Creator>) => {
    const next = { ...c, ...patch };
    setC(next);
    onSave(next);
  };
  return (
    <div className="flex items-center gap-2">
      <input className="input flex-1" value={c.name} onChange={(e) => save({ name: e.target.value })} />
      <select className="input w-32" value={c.type} onChange={(e) => save({ type: e.target.value as Creator['type'] })}>
        <option value="in-house">In-house</option>
        <option value="event-team">Event team</option>
        <option value="ugc">UGC</option>
        <option value="no-film">No-film</option>
      </select>
      <label className="flex items-center gap-1 text-xs text-stone-500">
        max/wk
        <input
          type="number"
          min={0}
          className="input w-16"
          value={c.max_weekly_slots}
          onChange={(e) => save({ max_weekly_slots: Number(e.target.value) })}
        />
      </label>
      <span className="w-28 text-xs text-stone-400">
        {c.allowed_products.length === 0 ? 'all products' : `${c.allowed_products.length} products`}
      </span>
      <button className="btn px-1.5 text-red-600" onClick={onDelete}>
        <IconTrash size={15} stroke={1.5} />
      </button>
    </div>
  );
}
