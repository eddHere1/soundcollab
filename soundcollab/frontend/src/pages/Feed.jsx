import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';

const GENRES = ['Trap', 'Drill', 'R&B', 'Hip-Hop', 'Pop', 'Lo-Fi', 'Afrobeats', 'EDM'];
const LOOKING_FOR = ['vocalist', 'collab', 'feedback'];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState({ loading: true, ok: false, error: null });
  const [filters, setFilters] = useState({
    type: '', genre: '', lookingFor: '', following: false, sort: 'newest',
  });

  useEffect(() => {
    api.health()
      .then((data) => setApiStatus({ loading: false, ok: data.status === 'ok', data, error: null }))
      .catch((err) => setApiStatus({ loading: false, ok: false, error: err.message }));
  }, []);

  const [feedError, setFeedError] = useState(null);

  const loadFeed = async () => {
    setLoading(true);
    setFeedError(null);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.genre) params.genre = filters.genre;
      if (filters.lookingFor) params.lookingFor = filters.lookingFor;
      if (filters.following) params.following = 'true';
      if (filters.sort) params.sort = filters.sort;
      const data = await api.posts.feed(params);
      setPosts(data);
    } catch (err) {
      setFeedError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, [filters]);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Discover</h1>
        <p className="text-dark-400">Fresh beats, songs, and collab opportunities</p>
        <div className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
          apiStatus.loading ? 'bg-dark-700 text-dark-300' :
          apiStatus.ok ? 'bg-emerald-500/15 text-emerald-300' :
          'bg-red-500/15 text-red-300'
        }`}>
          <span className={`h-2 w-2 rounded-full ${
            apiStatus.loading ? 'bg-dark-400 animate-pulse' :
            apiStatus.ok ? 'bg-emerald-400' : 'bg-red-400'
          }`} />
          {apiStatus.loading && 'Checking API connection...'}
          {apiStatus.ok && `API connected — ${JSON.stringify(apiStatus.data)}`}
          {!apiStatus.loading && !apiStatus.ok && `API unreachable — ${apiStatus.error}`}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <select
          className="input w-auto text-sm"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
        </select>
        <select
          className="input w-auto text-sm"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All types</option>
          <option value="beat">Beats only</option>
          <option value="song">Songs only</option>
        </select>
        <select
          className="input w-auto text-sm"
          value={filters.genre}
          onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
        >
          <option value="">All genres</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          className="input w-auto text-sm"
          value={filters.lookingFor}
          onChange={(e) => setFilters({ ...filters, lookingFor: e.target.value })}
        >
          <option value="">All posts</option>
          {LOOKING_FOR.map((l) => <option key={l} value={l}>Looking for {l}</option>)}
        </select>
        <button
          onClick={() => setFilters({ ...filters, following: !filters.following })}
          className={`btn text-sm ${filters.following ? 'btn-primary' : 'btn-secondary'}`}
        >
          Following
        </button>
      </div>

      {feedError && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{feedError}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-dark-400">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-dark-400">No posts yet. Be the first to upload!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={loadFeed} />
          ))}
        </div>
      )}
    </Layout>
  );
}
