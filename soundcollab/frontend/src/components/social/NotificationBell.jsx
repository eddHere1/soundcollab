import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function notifLabel(n) {
  const name = n.actor_username || 'Someone';
  switch (n.type) {
    case 'friend_request': return `${name} sent you a friend request`;
    case 'message': return `${name} sent you a message`;
    case 'collab_request': return `${name} sent a collab request`;
    case 'like': return n.content || `${name} liked your track`;
    case 'comment': return `${name} commented on your track`;
    default: return n.content || 'New notification';
  }
}

function notifLink(n) {
  switch (n.type) {
    case 'friend_request': return '/friends';
    case 'message': return n.target_id ? `/messages/${n.target_id}` : '/messages';
    case 'collab_request': return '/collabs';
    case 'like':
    case 'comment': return n.target_id ? `/` : '/';
    default: return '/';
  }
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  const load = async () => {
    if (!user) return;
    try {
      const [{ count: c }, list] = await Promise.all([
        api.notifications.unreadCount(),
        api.notifications.list(),
      ]);
      setCount(c);
      setItems(list.slice(0, 8));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const handleClick = async (n) => {
    if (!n.read_at) {
      await api.notifications.markRead(n.id).catch(() => {});
      setCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    navigate(notifLink(n));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) load(); }}
        className="btn-icon !h-9 !w-9 relative text-text-secondary"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl glass-strong shadow-glow">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-bold">Notifications</span>
            {count > 0 && (
              <button
                onClick={async () => {
                  await api.notifications.markAllRead();
                  setCount(0);
                  load();
                }}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-spotify-muted">No notifications yet</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-spotify-highlight ${
                    !n.read_at ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan text-sm font-bold text-white">
                    {n.actor_username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{notifLabel(n)}</p>
                    <p className="mt-0.5 text-xs text-spotify-muted">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
