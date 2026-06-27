import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePlayer, postToTrack } from '../context/PlayerContext';
import AppShell from '../components/layout/AppShell';
import CoverArt from '../components/music/CoverArt';

export default function PlaylistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setPlaylist(await api.playlists.get(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const isOwner = user && playlist && user.id === playlist.user_id;
  const tracks = (playlist?.items || []).map(postToTrack);

  const playAll = () => {
    if (!tracks.length) return;
    playTrack(tracks[0], tracks, false);
  };

  const playFrom = (index) => {
    if (!tracks.length) return;
    playTrack(tracks[index], tracks, false);
  };

  const removeTrack = async (postId) => {
    await api.playlists.removeItem(id, postId);
    load();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-text-secondary">Loading playlist...</div>
      </AppShell>
    );
  }

  if (error || !playlist) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <p className="text-text-secondary">{error || 'Playlist not found'}</p>
          <Link to="/library" className="btn-secondary mt-4 inline-flex">Back to Library</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link to="/library" className="mb-6 inline-flex text-sm text-text-secondary hover:text-accent">
        ← Back to Library
      </Link>

      <div className="mb-8 flex flex-wrap items-end gap-6">
        <div className="h-48 w-48 shrink-0 overflow-hidden rounded-2xl shadow-glow">
          {playlist.items?.[0] ? (
            <CoverArt seed={playlist.items[0].id} type={playlist.items[0].type} size="grid" className="!h-full !w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/20 text-4xl">♪</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Playlist</p>
          <h1 className="font-heading text-4xl font-extrabold">{playlist.name}</h1>
          {playlist.description && (
            <p className="mt-2 max-w-xl text-text-secondary">{playlist.description}</p>
          )}
          <p className="mt-2 text-sm text-text-secondary">
            {playlist.items?.length || 0} tracks
            {playlist.is_public ? ' · Public' : ' · Private'}
          </p>
          {tracks.length > 0 && (
            <button onClick={playAll} className="btn-primary mt-4">
              Play all
            </button>
          )}
        </div>
      </div>

      {playlist.items?.length === 0 ? (
        <div className="glass-card py-16 text-center text-text-secondary">
          No tracks in this playlist yet.
        </div>
      ) : (
        <div className="space-y-2">
          {playlist.items.map((post, i) => (
            <div key={post.id} className="group flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
              <button
                onClick={() => playFrom(i)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-text-secondary hover:bg-accent hover:text-white"
              >
                {i + 1}
              </button>
              <CoverArt seed={post.id} type={post.type} size="sm" className="!h-10 !w-10 !rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{post.title}</p>
                <p className="truncate text-xs text-text-secondary">{post.username}</p>
              </div>
              {isOwner && (
                <button
                  onClick={() => removeTrack(post.id)}
                  className="btn-ghost !px-2 !text-xs opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
