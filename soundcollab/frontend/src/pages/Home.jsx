import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AppShell from '../components/layout/AppShell';
import HeroSection from '../components/landing/HeroSection';
import FeaturedBeats from '../components/landing/FeaturedBeats';
import ProducerCards from '../components/landing/ProducerCards';
import TrendingCollabs from '../components/landing/TrendingCollabs';
import PricingSection from '../components/landing/PricingSection';
import PostCard from '../components/music/PostCard';
import TrendingCard from '../components/music/TrendingCard';

function FeedSection({ title, subtitle, posts, queue, onUpdate, horizontal }) {
  if (!posts?.length) return null;
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {horizontal ? (
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {posts.map((post) => (
            <TrendingCard key={post.id} post={post} queue={queue} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} queue={queue} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [trendingBeats, setTrendingBeats] = useState([]);
  const [beats, setBeats] = useState([]);
  const [newArtists, setNewArtists] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [feed, songs, hotBeats, marketplace, charts] = await Promise.all([
        api.posts.feed({ sort: 'newest', limit: 15 }),
        api.posts.feed({ sort: 'trending', type: 'song', limit: 10 }),
        api.posts.feed({ sort: 'trending', type: 'beat', limit: 10 }),
        api.beats.marketplace({ limit: 8 }).catch(() => []),
        api.charts.get(8).catch(() => null),
      ]);
      setRecent(feed);
      setTrendingSongs(songs);
      setTrendingBeats(hotBeats);
      setBeats(marketplace.length ? marketplace : hotBeats);
      if (charts) {
        setNewArtists(charts.newArtists || []);
        setRecommended(charts.growing || []);
      }
      try {
        const suggested = await api.users.suggested();
        if (suggested?.length) setRecommended(suggested);
      } catch { /* guest */ }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const producers = useMemo(() => {
    const map = new Map();
    for (const post of [...trendingBeats, ...recent]) {
      if (!map.has(post.user_id)) {
        map.set(post.user_id, {
          user_id: post.user_id,
          username: post.username,
          track_count: 1,
          genre_tags: post.genre_tags || [],
        });
      } else map.get(post.user_id).track_count += 1;
    }
    return [...map.values()].sort((a, b) => b.track_count - a.track_count);
  }, [trendingBeats, recent]);

  const allQueue = [...recent, ...trendingSongs, ...trendingBeats];

  return (
    <AppShell fullWidth>
      <HeroSection />
      <FeaturedBeats beats={beats} loading={loading} />

      <div className="px-4 sm:px-6 lg:px-8">
        <FeedSection
          title="Trending Songs"
          subtitle="What's heating up right now"
          posts={trendingSongs}
          queue={allQueue}
          onUpdate={load}
          horizontal
        />
        <FeedSection
          title="Trending Beats"
          subtitle="Top instrumentals from producers"
          posts={trendingBeats}
          queue={allQueue}
          onUpdate={load}
          horizontal
        />
      </div>

      <ProducerCards producers={newArtists.length ? newArtists : producers} />

      {recommended.length > 0 && (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="section-title">Recommended Creators</h2>
            <p className="section-subtitle mb-6">Fast-growing talent you should know</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.slice(0, 8).map((u) => (
                <Link key={u.id || u.user_id} to={`/profile/${u.id || u.user_id}`} className="glass-card flex items-center gap-3 !p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan font-bold">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{u.username}</p>
                    <p className="text-xs capitalize text-text-secondary">{u.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <TrendingCollabs posts={[...trendingSongs, ...recent]} />
      <PricingSection />

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="section-title">Recently Uploaded</h2>
            <p className="section-subtitle">Fresh drops from the community</p>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card h-36 animate-pulse !bg-card/50" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="glass-card py-16 text-center text-text-secondary">
              No posts yet. <Link to="/upload" className="text-accent hover:underline">Upload the first track</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.map((post) => (
                <PostCard key={post.id} post={post} queue={allQueue} onUpdate={load} />
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
