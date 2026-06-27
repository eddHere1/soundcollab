import { mediaUrl } from '../api/client';

export default function Avatar({ src, username, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' };
  const initial = username?.[0]?.toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={mediaUrl(src)}
        alt={username}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-dark-600`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-brand-600/30 font-semibold text-brand-300 ring-2 ring-dark-600`}
    >
      {initial}
    </div>
  );
}
