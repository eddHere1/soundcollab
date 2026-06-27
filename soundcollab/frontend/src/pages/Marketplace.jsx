import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePlayer, postToTrack } from '../context/PlayerContext';
import AppShell from '../components/layout/AppShell';
import CoverArt from '../components/music/CoverArt';
import WaveformVisual from '../components/music/WaveformVisual';
import { MARKETPLACE_CATEGORIES, GENRES, MOODS } from '../constants/platform';

export default function Marketplace() {
  const { user } = useAuth();
  const { track, isPlaying, playTrack, togglePlay } = usePlayer();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('beats');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = { category };
    if (genre) params.genre = genre;
    if (mood) params.mood = mood;
    api.beats.marketplace(params).then(setItems).finally(() => setLoading(false));
  }, [category, genre, mood]);

  const handlePurchase = async (postId) => {
    if (!user) { window.location.href = '/login'; return; }
    setPurchasing(postId);
    try {
      await api.beats.purchase(postId);
      alert('Purchase successful!');
    } catch (err) {
      alert(err.message);
    } finally {
      setPurchasing(null);
    }
  };

  const queue = items.map(postToTrack);

  return (
    <AppShell>
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-extrabold sm:text-4xl">
          Underground <span className="neon-text">Marketplace</span>
        </h1>
        <p className="mt-2 max-w-lg text-text-secondary">
          Beats, hooks, loops, kits, and services from underground creators.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {MARKETPLACE_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${category === c.id ? 'bg-accent text-white shadow-glow' : 'glass'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <select className="select !w-auto !py-2" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="select !w-auto !py-2" value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="">All moods</option>
          {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card h-72 animate-pulse !bg-card/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card py-20 text-center text-text-secondary">
          No items in this category yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const isActive = track?.id === item.id;
            const playing = isActive && isPlaying;
            return (
              <div key={item.id} className="group glass-card overflow-hidden !p-0">
                <div className="relative">
                  <CoverArt seed={item.id} type={item.type} size="grid" className="!rounded-none !rounded-t-2xl" />
                  <button type="button"
                    onClick={() => (isActive ? togglePlay() : playTrack(postToTrack(item), queue))}
                    className={`play-btn absolute bottom-4 right-4 h-11 w-11 ${playing ? 'opacity-100 play-btn-pulse' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
                    {playing ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    ) : (
                      <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <p className="truncate font-heading font-semibold">{item.title}</p>
                  <Link to={`/profile/${item.user_id}`} className="text-sm text-text-secondary hover:text-accent">{item.username}</Link>
                  <WaveformVisual seed={item.id} active={playing} className="mt-3 !h-7" />
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-heading text-lg font-bold text-success">${Number(item.price).toFixed(2)}</span>
                    <button onClick={() => handlePurchase(item.id)} disabled={purchasing === item.id} className="btn-primary !rounded-full !px-4 !py-1.5 !text-xs">
                      {purchasing === item.id ? '...' : 'Buy'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
