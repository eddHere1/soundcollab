import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import AppShell from '../components/layout/AppShell';
import PostCard from '../components/music/PostCard';
import { SEARCH_FILTERS, GENRES, MOODS } from '../constants/platform';

export default function Search() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [sort, setSort] = useState('newest');
  const [posts, setPosts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const roleFilters = ['producer', 'engineer'];
        if (filter === 'artists' || roleFilters.includes(filter)) {
          const users = await api.users.search(query, {
            role: roleFilters.includes(filter) ? filter : undefined,
          });
          setArtists(users);
          setPosts([]);
        } else {
          const params = { sort, limit: 30 };
          if (query.trim()) params.q = query.trim();
          if (genre) params.genre = genre;
          if (mood) params.mood = mood;
          if (filter === 'collab') params.lookingFor = 'collab';
          else if (filter !== 'all') params.type = filter;
          const data = await api.posts.feed(params);
          setPosts(data);
          setArtists([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filter, genre, mood, sort]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 font-heading text-3xl font-extrabold">Discover</h1>
        <p className="mb-6 text-text-secondary">Search songs, beats, artists, and collabs</p>

        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" />
          </svg>
          <input
            className="input !rounded-full !py-4 !pl-12 !text-base"
            placeholder="Search tracks, artists, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SEARCH_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === f.id ? 'bg-accent text-white' : 'glass'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select className="select !w-auto !py-2" value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">All genres</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="select !w-auto !py-2" value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="">All moods</option>
            {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="select !w-auto !py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
          </select>
        </div>

        {loading ? (
          <p className="text-text-secondary">Searching...</p>
        ) : filter === 'artists' || filter === 'producer' || filter === 'engineer' ? (
          <div className="space-y-2">
            {artists.length === 0 ? (
              <p className="text-text-secondary">No artists found</p>
            ) : artists.map((a) => (
              <Link key={a.id} to={`/profile/${a.id}`} className="glass-card flex items-center gap-4 !p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                  {a.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold">{a.username}</p>
                  <p className="text-sm capitalize text-text-secondary">{a.role}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <p className="text-text-secondary">No results</p>
            ) : posts.map((post) => (
              <PostCard key={post.id} post={post} queue={posts} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
