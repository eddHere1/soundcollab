import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePlayer, postToTrack } from '../context/PlayerContext';
import AppShell from '../components/layout/AppShell';
import PostCard from '../components/music/PostCard';

const TABS = ['uploads', 'saved', 'liked', 'purchases', 'recent', 'playlists'];

export default function Library() {
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [tab, setTab] = useState('uploads');
  const [posts, setPosts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylist, setNewPlaylist] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      setLoading(true);
      try {
        if (tab === 'uploads') {
          const profile = await api.users.get(user.id);
          setPosts(profile.posts || []);
        } else if (tab === 'saved') {
          setPosts(await api.posts.saved());
        } else if (tab === 'liked') {
          setPosts(await api.posts.liked());
        } else if (tab === 'recent') {
          setPosts(await api.posts.recent());
        } else if (tab === 'playlists') {
          setPlaylists(await api.playlists.list());
        } else {
          setPurchases(await api.beats.purchases());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, tab, reloadKey]);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylist.trim()) return;
    await api.playlists.create({ name: newPlaylist, is_public: false });
    setNewPlaylist('');
    reload();
  };

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center py-24 text-center">
          <h1 className="mb-2 font-heading text-3xl font-extrabold">Your Library</h1>
          <p className="mb-6 text-text-secondary">Log in to access your collection</p>
          <Link to="/login" className="btn-primary">Log in</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="mb-6 font-heading text-3xl font-extrabold">Your Library</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-bold capitalize ${tab === t ? 'bg-accent text-white' : 'glass'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : tab === 'playlists' ? (
        <div>
          <form onSubmit={createPlaylist} className="mb-6 flex gap-2">
            <input className="input flex-1" placeholder="New playlist name" value={newPlaylist} onChange={(e) => setNewPlaylist(e.target.value)} />
            <button type="submit" className="btn-primary">Create</button>
          </form>
          {playlists.length === 0 ? (
            <div className="glass-card py-12 text-center text-text-secondary">No playlists yet</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((pl) => (
                <Link key={pl.id} to={`/library/playlist/${pl.id}`} className="glass-card !p-5 transition hover:border-accent/30">
                  <p className="font-heading font-semibold">{pl.name}</p>
                  <p className="text-sm text-text-secondary">{pl.item_count || 0} tracks</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'purchases' ? (
        purchases.length === 0 ? (
          <div className="glass-card py-16 text-center text-text-secondary">No purchases yet</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((p) => (
              <div key={p.id} className="glass-card !p-4">
                <p className="font-bold">{p.title}</p>
                <p className="text-sm text-text-secondary">by {p.seller_username}</p>
                <p className="mt-2 font-semibold text-success">${Number(p.price).toFixed(2)}</p>
                {p.audio_url && (
                  <button onClick={() => playTrack(postToTrack(p), [postToTrack(p)])} className="btn-secondary mt-3 !text-xs">
                    Play
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      ) : posts.length === 0 ? (
        <div className="glass-card py-16 text-center text-text-secondary">
          Nothing here yet.{tab === 'uploads' && <> <Link to="/upload" className="text-accent">Upload</Link></>}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => <PostCard key={post.id} post={post} queue={posts} onUpdate={reload} />)}
        </div>
      )}
    </AppShell>
  );
}
