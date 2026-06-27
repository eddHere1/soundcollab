import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import CoverArt from './CoverArt';
import WaveformVisual from './WaveformVisual';
import CollabRequestModal from './CollabRequestModal';
import QueueDrawer from '../layout/QueueDrawer';

function formatTime(sec) {
  if (!sec || !Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FullPlayerModal() {
  const { user } = useAuth();
  const {
    track, isPlaying, isShuffle, progress, duration, volume, fullScreen, queue,
    togglePlay, skipNext, skipPrev, seek, setVolume, closeFullPlayer, setShowQueue,
    toggleShuffle, addPostToQueue,
  } = usePlayer();

  const post = track?.post;
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showCollab, setShowCollab] = useState(false);

  useEffect(() => {
    if (!post || !fullScreen) return;
    setLiked(post.liked_by_me || false);
    setSaved(post.saved_by_me || false);
    setLikesCount(Number(post.likes_count) || 0);
    api.posts.comments(post.id).then(setComments).catch(() => setComments([]));
  }, [post, fullScreen]);

  if (!fullScreen || !track || !post) return null;

  const pct = duration ? (progress / duration) * 100 : 0;
  const isOwner = user?.id === post.user_id;

  const handleLike = async () => {
    if (!user) return;
    await api.posts.like(post.id);
    setLiked(!liked);
    setLikesCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSave = async () => {
    if (!user) return;
    const res = await api.posts.save(post.id);
    setSaved(res.saved);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    const c = await api.posts.addComment(post.id, commentText);
    setComments([...comments, c]);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-base">
      <QueueDrawer />
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <button onClick={closeFullPlayer} className="btn-ghost touch-target !px-3" aria-label="Close">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <span className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Now Playing</span>
        <button onClick={() => setShowQueue(true)} className="btn-ghost touch-target !px-2 text-xs sm:!px-3 sm:text-sm" title="Queue">
          Queue ({queue.length})
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4 sm:px-8">
          <div className="mb-4 w-full max-w-[280px] sm:mb-8 sm:max-w-sm">
            <CoverArt seed={post.id} type={post.type} coverUrl={track.coverUrl} size="grid" className="!aspect-square shadow-glow" />
          </div>
          <h2 className="mb-1 text-center text-xl font-black sm:text-2xl">{track.title}</h2>
          <Link to={`/profile/${track.userId}`} onClick={closeFullPlayer} className="mb-6 text-text-secondary hover:text-accent">
            {track.artist}
          </Link>

          <WaveformVisual
            seed={post.id}
            audioUrl={track.audioUrl}
            active={isPlaying}
            variant="player"
            progress={progress}
            duration={duration}
            onSeek={(ratio) => duration > 0 && seek(ratio * duration)}
            className="mb-6 w-full max-w-lg !h-12"
          />

          <div className="mb-4 flex w-full max-w-lg items-center gap-2 text-xs text-text-secondary">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full accent-accent"
              style={{ background: `linear-gradient(to right, #8B5CF6 ${pct}%, #1E1E28 ${pct}%)` }}
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="mb-6 flex items-center gap-6">
            <button onClick={toggleShuffle} className={`transition ${isShuffle ? 'text-accent' : 'text-text-secondary hover:text-accent'}`} title="Shuffle">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
            </button>
            <button onClick={skipPrev} className="text-text-secondary hover:text-accent">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" /></svg>
            </button>
            <button
              onClick={togglePlay}
              className="play-btn h-14 w-14 play-btn-pulse"
            >
              {isPlaying ? (
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="h-7 w-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
              )}
            </button>
            <button onClick={skipNext} className="text-text-secondary hover:text-accent">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18h2V6h-2v12zm-11-7 8.5-6v12l-8.5-6z" /></svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={handleLike} disabled={!user} className={`btn-secondary !text-sm ${liked ? '!text-accent' : ''}`}>
              {liked ? '♥' : '♡'} {likesCount}
            </button>
            <button onClick={handleSave} disabled={!user} className={`btn-secondary !text-sm ${saved ? '!text-accent' : ''}`}>
              {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => post && addPostToQueue(post)} className="btn-secondary !text-sm">+ Queue</button>
            {user && !isOwner && (
              <button onClick={() => setShowCollab(true)} className="btn-secondary !text-sm">Request Collab</button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-text-secondary" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3z" /></svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-32 accent-accent"
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {post.genre_tags?.map((g) => <span key={g} className="pill-genre">{g}</span>)}
            {post.looking_for?.map((l) => <span key={l} className="pill-looking">{l}</span>)}
          </div>
        </div>

        <div className="flex w-full flex-col border-t border-white/10 lg:w-96 lg:border-l lg:border-t-0">
          <div className="border-b border-white/10 px-4 py-3 font-semibold sm:px-4">
            Comments ({comments.length})
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-text-secondary">No comments yet</p>
            ) : comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold">
                  {c.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.username}</p>
                  <p className="text-sm text-text-secondary">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          {user && (
            <form onSubmit={submitComment} className="flex gap-2 border-t border-white/10 p-4">
              <input
                className="input flex-1 text-sm"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" className="btn-primary !px-4 !text-sm">Post</button>
            </form>
          )}
        </div>
      </div>

      {showCollab && <CollabRequestModal postId={post.id} onClose={() => setShowCollab(false)} />}
    </div>
  );
}
