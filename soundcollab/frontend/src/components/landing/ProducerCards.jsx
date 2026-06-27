import { Link } from 'react-router-dom';

export default function ProducerCards({ producers = [] }) {
  const display = producers.slice(0, 6);

  if (display.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="section-title">Top Producers</h2>
          <p className="section-subtitle mx-auto max-w-md">
            Rising talent shaping the underground sound
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((producer, i) => (
            <Link
              key={producer.user_id}
              to={`/profile/${producer.user_id}`}
              className="group glass-card flex items-center gap-4 !p-5"
            >
              <div className="relative shrink-0">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-cyan text-xl font-bold text-white shadow-glow transition group-hover:shadow-glow-lg"
                >
                  {producer.username?.[0]?.toUpperCase()}
                </div>
                {i < 3 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold">
                    {i + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading font-semibold group-hover:text-accent transition-colors">
                  {producer.username}
                </p>
                <p className="text-sm text-text-secondary">
                  {producer.track_count || producer.posts_count || 0} tracks
                  {producer.genre && ` · ${producer.genre}`}
                </p>
                <div className="mt-2 flex gap-1">
                  {(producer.genre_tags || ['Trap', '808']).slice(0, 2).map((g) => (
                    <span key={g} className="pill-genre !text-[10px]">{g}</span>
                  ))}
                </div>
              </div>
              <svg className="h-5 w-5 shrink-0 text-text-secondary transition group-hover:text-accent group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
