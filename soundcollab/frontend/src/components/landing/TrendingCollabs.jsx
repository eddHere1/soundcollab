import { Link } from 'react-router-dom';
import CoverArt from '../music/CoverArt';

export default function TrendingCollabs({ posts = [] }) {
  const collabPosts = posts.filter(
    (p) => p.looking_for?.length > 0 || p.type === 'song'
  ).slice(0, 6);

  if (collabPosts.length === 0) return null;

  return (
    <section className="relative px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">Trending Collabs</h2>
            <p className="section-subtitle">Artists looking for their next feature</p>
          </div>
          <Link to="/collabs" className="btn-ghost hidden text-sm sm:inline-flex">
            Browse collabs →
          </Link>
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {collabPosts.map((post) => (
            <Link
              key={post.id}
              to={`/profile/${post.user_id}`}
              className="group w-[280px] shrink-0 glass-card !p-0 overflow-hidden"
            >
              <div className="relative h-36">
                <CoverArt seed={post.id} type={post.type} size="lg" className="!h-full !rounded-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="truncate font-heading font-semibold">{post.title}</p>
                  <p className="text-sm text-text-secondary">{post.username}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan">Looking for</p>
                <div className="flex flex-wrap gap-1.5">
                  {(post.looking_for || ['Vocalist', 'Producer']).slice(0, 3).map((tag) => (
                    <span key={tag} className="pill-looking !normal-case">{tag}</span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-text-secondary group-hover:text-accent transition-colors">
                  Request collab →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
