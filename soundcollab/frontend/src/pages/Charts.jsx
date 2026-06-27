import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AppShell from '../components/layout/AppShell';
import TrendingCard from '../components/music/TrendingCard';
import CoverArt from '../components/music/CoverArt';

export default function Charts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.charts.get(12).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <p className="text-text-secondary">Loading charts...</p>
      </AppShell>
    );
  }

  const { artists, beats, growing, collaborators, newArtists } = data || {};

  return (
    <AppShell>
      <h1 className="mb-2 font-heading text-3xl font-extrabold">Trending & Charts</h1>
      <p className="mb-10 text-text-secondary">Who's moving the underground right now</p>

      <section className="mb-12">
        <h2 className="section-title mb-4">Trending Artists</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artists?.map((a, i) => (
            <Link key={a.id} to={`/profile/${a.id}`} className="glass-card flex items-center gap-4 !p-4">
              <span className="font-heading text-2xl font-bold text-accent w-8">{i + 1}</span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-cyan font-bold">
                {a.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{a.username}</p>
                <p className="text-xs text-text-secondary">{a.total_likes} likes · {a.track_count} tracks</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="section-title mb-4">Trending Beats</h2>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {beats?.map((post) => (
            <TrendingCard key={post.id} post={post} queue={beats} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="section-title mb-4">Fastest Growing Creators</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {growing?.map((u) => (
            <Link key={u.id} to={`/profile/${u.id}`} className="glass-card !p-4 text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 font-bold text-accent">
                {u.username?.[0]?.toUpperCase()}
              </div>
              <p className="font-semibold">{u.username}</p>
              <p className="text-xs text-success">+{u.new_followers} followers</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="section-title mb-4">Most Active Collaborators</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {collaborators?.map((u) => (
            <Link key={u.id} to={`/profile/${u.id}`} className="glass-card flex items-center gap-3 !p-4">
              <CoverArt seed={u.id} type="song" size="sm" className="!rounded-xl" />
              <div>
                <p className="font-semibold">{u.username}</p>
                <p className="text-xs text-text-secondary">{u.collab_count} collabs</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-4">New Artists</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {newArtists?.map((u) => (
            <Link key={u.id} to={`/profile/${u.id}`} className="glass-card !p-4">
              <p className="font-semibold">{u.username}</p>
              <p className="text-xs capitalize text-text-secondary">{u.role} · {u.track_count} tracks</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
