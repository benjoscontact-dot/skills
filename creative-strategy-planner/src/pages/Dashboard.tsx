import { Link, useNavigate } from 'react-router-dom';
import { format, addMonths } from 'date-fns';
import { IconPlus, IconArrowRight } from '@tabler/icons-react';
import { useStore, monthKey } from '../lib/store';
import { statusPillClasses } from '../lib/ui';
import { validatePlan } from '../lib/autoSuggest';

export default function Dashboard() {
  const plans = useStore((s) => s.plans);
  const products = useStore((s) => s.products);
  const concepts = useStore((s) => s.concepts);
  const navigate = useNavigate();

  const nextMonth = monthKey(addMonths(new Date(), 1));
  const planList = Object.values(plans).sort((a, b) => (a.month < b.month ? 1 : -1));

  // Yearly stats
  const thisYear = new Date().getFullYear();
  const yearPlans = planList.filter((p) => new Date(p.month).getFullYear() === thisYear);
  const totalAds = yearPlans.reduce((n, p) => n + p.slots.filter((s) => !s.is_backup).length, 0);
  const avgIteration =
    yearPlans.length > 0
      ? Math.round(
          (yearPlans.reduce((sum, p) => sum + validatePlan(p.slots, products).iterationPct, 0) / yearPlans.length) * 100,
        )
      : 0;
  const topConcept = [...concepts].sort((a, b) => (b.last_roas || 0) - (a.last_roas || 0))[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Dashboard</h1>
          <p className="text-sm text-stone-500">Plan a month of Meta video ads across your products.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/plan/${nextMonth}`)}>
          <IconPlus size={16} stroke={1.5} /> Plan next month
        </button>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-stone-500">Ads planned in {thisYear}</div>
          <div className="mt-1 text-2xl font-medium">{totalAds}</div>
        </div>
        <div className="card">
          <div className="text-sm text-stone-500">Avg iteration ratio</div>
          <div className="mt-1 text-2xl font-medium">{avgIteration}%</div>
        </div>
        <div className="card">
          <div className="text-sm text-stone-500">Top concept (ROAS)</div>
          <div className="mt-1 truncate text-base font-medium">
            {topConcept ? `${topConcept.angle} — ${topConcept.last_roas?.toFixed(1) ?? '—'}` : '—'}
          </div>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-medium text-stone-500">Month plans</h2>
      {planList.length === 0 ? (
        <div className="card text-center text-sm text-stone-500">
          No plans yet. Start by planning next month.
        </div>
      ) : (
        <div className="space-y-2">
          {planList.map((p) => {
            const v = validatePlan(p.slots, products);
            return (
              <Link
                key={p.month}
                to={`/plan/${p.month}`}
                className="card flex items-center justify-between hover:border-stone-400 dark:hover:border-stone-600"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-medium">{format(new Date(p.month), 'MMMM yyyy')}</span>
                  <span className={`pill ${statusPillClasses(p.status)}`}>{p.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <span>{p.slots.filter((s) => !s.is_backup).length} ads</span>
                  <span className={v.isValid ? 'text-emerald-600' : 'text-amber-600'}>
                    {v.isValid ? 'Strategy valid' : `${v.warnings.length} warnings`}
                  </span>
                  <IconArrowRight size={16} stroke={1.5} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
