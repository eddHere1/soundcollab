import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../social/NotificationBell';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/search', label: 'Discover' },
  { to: '/charts', label: 'Charts' },
  { to: '/library', label: 'Library' },
  { to: '/friends', label: 'Friends' },
  { to: '/messages', label: 'Messages' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
            <svg className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            Sound<span className="text-accent">Collab</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent shadow-glow" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && <NotificationBell />}
          <Link to="/upload" className="btn-primary !rounded-full !px-5 !py-2 !text-xs">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
            Upload Beat
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <NavLink
                to={`/profile/${user.id}`}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan text-xs font-bold text-white">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              </NavLink>
              <button onClick={logout} className="btn-ghost !px-2 !text-xs">Log out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !text-sm">Log in</Link>
              <Link to="/register" className="btn-secondary !text-sm">Sign up</Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-icon !h-9 !w-9 md:hidden"
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.06] px-4 py-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium ${
                    isActive ? 'bg-accent/15 text-accent' : 'text-text-secondary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link to="/upload" onClick={() => setMobileOpen(false)} className="btn-primary mt-2 w-full">
              Upload Beat
            </Link>
            {!user && (
              <div className="mt-2 flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">Log in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Sign up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
