import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IconCalendarStats, IconSettings, IconMoon, IconSun } from '@tabler/icons-react';

export default function Layout() {
  const [dark, setDark] = useState(() => localStorage.getItem('csp-theme') === 'dark');
  const loc = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('csp-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3 dark:border-stone-800 dark:bg-stone-900">
        <Link to="/" className="flex items-center gap-2 text-sm font-medium">
          <IconCalendarStats size={20} stroke={1.5} />
          Creative strategy planner
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`btn ${loc.pathname === '/' ? 'btn-primary' : ''}`}
          >
            Dashboard
          </Link>
          <Link to="/settings" className={`btn ${loc.pathname === '/settings' ? 'btn-primary' : ''}`}>
            <IconSettings size={16} stroke={1.5} /> Settings
          </Link>
          <button className="btn" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
            {dark ? <IconSun size={16} stroke={1.5} /> : <IconMoon size={16} stroke={1.5} />}
          </button>
        </nav>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
