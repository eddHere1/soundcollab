import { Link } from 'react-router-dom';
import { getCoverGradient } from '../../utils/coverArt';

export function UserAvatar({ user, size = 'md' }) {
  const sizes = { sm: 'h-10 w-10 text-sm', md: 'h-14 w-14 text-lg', lg: 'h-20 w-20 text-2xl' };
  const gradient = getCoverGradient(user?.username || user?.id || '?');
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizes[size]}`}
      style={{ background: gradient }}
    >
      {user?.username?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

export function FriendCard({ user, actions }) {
  return (
    <div className="surface flex items-center gap-4 p-4 transition hover:bg-spotify-highlight/50">
      <Link to={`/profile/${user.id}`}>
        <UserAvatar user={user} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/profile/${user.id}`} className="font-bold hover:underline">
          {user.username}
        </Link>
        <p className="text-sm capitalize text-spotify-muted">{user.role}</p>
        {user.bio && <p className="mt-1 truncate text-xs text-spotify-subtle">{user.bio}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export function ConversationRow({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 p-3 text-left transition hover:bg-spotify-highlight ${
        active ? 'bg-spotify-highlight' : ''
      }`}
    >
      <UserAvatar user={{ username: item.username, id: item.other_user_id }} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{item.username}</p>
          {item.unread_count > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
              {item.unread_count}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-spotify-muted">{item.last_message || 'Start chatting'}</p>
      </div>
    </button>
  );
}
