import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { useStore } from '../lib/store';
import { validatePlan } from '../lib/autoSuggest';
import type { MonthPlan } from '../lib/types';

function Bar({ label, pct, lo, hi, target }: { label: string; pct: number; lo: number; hi: number; target: number }) {
  const value = Math.round(pct * 100);
  const inRange = value >= lo && value <= hi;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={inRange ? 'text-emerald-600' : 'text-amber-600'}>
          {value}% <span className="text-stone-400">/ {target}%</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
        <div
          className={`h-full rounded-full ${inRange ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export default function ValidatorPanel({ plan }: { plan: MonthPlan }) {
  const products = useStore((s) => s.products);
  const v = validatePlan(plan.slots, products);

  return (
    <div className="sticky top-4 space-y-4">
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Strategy validator</h3>
          {v.isValid ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <IconCircleCheck size={15} stroke={1.5} /> Valid
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <IconAlertTriangle size={15} stroke={1.5} /> {v.warnings.length}
            </span>
          )}
        </div>
        <Bar label="Iterations" pct={v.iterationPct} lo={40} hi={70} target={50} />
        <Bar label="Adjacent" pct={v.adjacentPct} lo={20} hi={40} target={30} />
        <Bar label="Net new" pct={v.netNewPct} lo={10} hi={30} target={20} />
        <div className="border-t border-stone-100 pt-2 text-xs text-stone-500 dark:border-stone-800">
          Hook diversity: <span className="font-medium text-stone-700 dark:text-stone-200">{v.hookDiversity} of 9</span>
          {' · '}
          {v.total} ads planned
        </div>
      </div>

      <div className="card">
        <h3 className="mb-2 text-sm font-medium">Warnings</h3>
        {v.warnings.length === 0 ? (
          <p className="text-sm text-stone-400">No warnings — strategy looks balanced.</p>
        ) : (
          <ul className="space-y-1.5">
            {v.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300">
                <IconAlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" stroke={1.5} />
                {w.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
