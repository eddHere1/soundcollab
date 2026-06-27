import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../social/NotificationBell';

const nav = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/search', label: 'Search', icon: SearchIcon },
  { to: '/upload', label: 'Upload', icon: UploadIcon },
  { to: '/messages', label: 'Messages', icon: MessagesIcon },
  { to: '/friends', label: 'Friends', icon: FriendsIcon },
  { to: '/library', label: 'Library', icon: LibraryIcon },
];

function HomeIcon({ active }) {
  return (
    <svg className={`h-6 w-6 ${active ? 'fill-white' : 'fill-spotify-muted'}`} viewBox="0 0 24 24">
      <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z" />
    </svg>
  );
}

function SearchIcon({ active }) {
  return (
    <svg className={`h-6 w-6 ${active ? 'stroke-white' : 'stroke-spotify-muted'}`} fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" />
    </svg>
  );
}

function UploadIcon({ active }) {
  return (
    <svg className={`h-6 w-6 ${active ? 'stroke-white' : 'stroke-spotify-muted'}`} fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
    </svg>
  );
}

function MessagesIcon({ active }) {
  return (
    <svg className={`h-6 w-6 ${active ? 'stroke-white' : 'stroke-spotify-muted'}`} fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.96L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function FriendsIcon({ active }) {
  return (
    <svg className={`h-6 w-6 ${active ? 'stroke-white' : 'stroke-spotify-muted'}`} fill="none" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function LibraryIcon({ active }) {
  return (
    <svg className={`h-6 w-6 ${active ? 'fill-white' : 'fill-spotify-muted'}`} viewBox="0 0 24 24">
      <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5.153a1 1 0 0 1 .986.836l.74 4.435a1 1 0 0 0 .54.695l6.516 3.13a1 1 0 0 1 0 1.804l-6.516 3.13a1 1 0 0 0-.54.695l-.74 4.435A1 1 0 0 1 8.153 22H3z" />
    </svg>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-[240px] shrink-0 flex-col bg-black px-3 py-6">
      <Link to="/" className="mb-8 px-3">
        <span className="text-2xl font-black tracking-tight">
          Sound<span className="text-spotify-green">Collab</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                isActive ? 'text-white' : 'text-spotify-muted hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        {user ? (
          <>
            <NotificationBell />
            <NavLink
              to={`/profile/${user.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${
                  isActive ? 'bg-spotify-highlight text-white' : 'text-spotify-muted hover:text-white'
                }`
              }
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-xs font-bold text-black">
                {user.username?.[0]?.toUpperCase()}
              </div>
              Profile
            </NavLink>
            <button onClick={logout} className="w-full px-3 text-left text-xs text-spotify-subtle hover:text-white">
              Log out
            </button>
          </>
        ) : (
          <div className="space-y-2 px-3">
            <Link to="/login" className="btn-secondary w-full text-xs">Log in</Link>
            <Link to="/register" className="btn-primary w-full text-xs">Sign up</Link>
          </div>
        )}
      </div>
    </aside>
  );
}
