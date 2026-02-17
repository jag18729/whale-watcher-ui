import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-whale-bg/90 backdrop-blur-md border-b border-whale-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="font-heading font-bold text-lg flex items-center gap-2">
            🐋 <span className="hidden sm:inline">Whale Watcher</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  location.pathname === l.to
                    ? 'bg-whale-border text-whale-text'
                    : 'text-whale-muted hover:text-whale-text'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-whale-muted hidden sm:block">{user?.email}</span>
          <button onClick={logout} className="text-sm text-whale-muted hover:text-whale-loss transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
