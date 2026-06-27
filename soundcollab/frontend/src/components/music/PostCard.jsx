import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mediaUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import CoverArt from './CoverArt';
import WaveformVisual from './WaveformVisual';
import CollabRequestModal from './CollabRequestModal';
import EditPostModal from './EditPostModal';

function isInteractive(el) {
  return el.closest('button, a, input, textarea, select, [data-no-play]');
}

export default function PostCard({ post, onUpdate, variant = 'feed', queue = [] }) {
  const { user } = useAuth();
  const { track, isPlaying, playPost, togglePlay, openFullPlayer, addPostToQueue } = usePlayer();
  const [liked, setLiked] = useState(post.liked_by_me || false);
  const [saved, setSaved] = useState(post.saved_by_me || false);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count) || 0);
  const [showCollab, setShowCollab] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const isOwner = user?.id === post.user_id;
  const isActive = track?.id === post.id;
  const playing = isActive && isPlaying;

  const handleCardClick = (e) => {
    if (isInteractive(e.target)) return;
    if (isActive) {
      openFullPlayer();
    } else {
      playPost(post, queue.length ? queue : [post], true);
    }
  };

  const handlePlayBtn = (e) => {
    e.stopPropagation();
    if (isActive) togglePlay();
    else playPost(post, queue.length ? queue : [post], true);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    await api.posts.like(post.id);
    setLiked(!liked);
    setLikesCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) return;
    const res = await api.posts.save(post.id);
    setSaved(res.saved);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this track permanently?')) return;
    setDeleting(true);
    try {
      await api.posts.delete(post.id);
      onUpdate?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!user || isOwner) return;
    if (following) await api.follows.unfollow(post.user_id);
    else await api.follows.follow(post.user_id);
    setFollowing(!following);
  };

  const toggleComments = async (e) => {
    e.stopPropagation();
    if (!showComments) {
      const list = await api.posts.comments(post.id).catch(() => []);
      setComments(list);
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim() || !user) return;
    const c = await api.posts.addComment(post.id, commentText);
    setComments([...comments, c]);
    setCommentText('');
  };

  const coverUrl = post.cover_image ? mediaUrl(post.cover_image) : null;

  const handleAddToQueue = (e) => {
    e.stopPropagation();
    addPostToQueue(post);
  };

  const handlePurchase = async (e) => {
    e.stopPropagation();
    if (!user) return;
    setPurchasing(true);
    try {
      await api.beats.purchase(post.id);
      alert('Beat purchased!');
      onUpdate?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  if (variant === 'grid') {
    return (
      <>
        <div className="group relative cursor-pointer" onClick={handleCardClick}>
          <CoverArt seed={post.id} type={post.type} coverUrl={coverUrl} size="grid" />
          <button
            onClick={handlePlayBtn}
            data-no-play
            className="play-btn absolute bottom-14 right-3 h-12 w-12 opacity-0 transition group-hover:opacity-100"
          >
            <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
          </button>
          {isOwner && (
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100" data-no-play>
              <button onClick={(e) => { e.stopPropagation(); setShowEdit(true); }} className="rounded-full bg-black/70 px-2 py-1 text-xs">Edit</button>
              <button onClick={handleDelete} disabled={deleting} className="rounded-full bg-black/70 px-2 py-1 text-xs text-red-400">Del</button>
            </div>
          )}
          <p className="mt-3 truncate font-semibold">{post.title}</p>
          <Link to={`/profile/${post.user_id}`} onClick={(e) => e.stopPropagation()} className="truncate text-sm text-text-secondary hover:text-accent">
            {post.username}
          </Link>
        </div>
        {showEdit && <EditPostModal post={post} onClose={() => setShowEdit(false)} onSaved={onUpdate} />}
      </>
    );
  }

  return (
    <>
      <article
        className="glass-card flex cursor-pointer flex-col gap-3 !p-3 sm:flex-row sm:gap-4 sm:!p-4"
        onClick={handleCardClick}
      >
        <div className="relative shrink-0 self-start">
          <CoverArt seed={post.id} type={post.type} coverUrl={coverUrl} size="sm" className="!h-20 !w-20 rounded-md sm:!h-28 sm:!w-28" />
          <button onClick={handlePlayBtn} data-no-play className="btn-icon absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {playing ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
            )}
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={`/profile/${post.user_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold uppercase tracking-wide text-text-secondary hover:text-accent"
              >
                {post.username}
              </Link>
              <h3 className="truncate text-lg font-bold">{post.title}</h3>
            </div>
            {post.price > 0 && (
              <span className="shrink-0 rounded-full bg-success/15 px-3 py-1 text-sm font-bold text-success">
                ${Number(post.price).toFixed(2)}
              </span>
            )}
          </div>

          {post.description && (
            <p className="mb-2 line-clamp-2 text-sm text-text-secondary">{post.description}</p>
          )}

          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.genre_tags?.map((g) => <span key={g} className="pill-genre">{g}</span>)}
            {post.looking_for?.map((l) => <span key={l} className="pill-looking">{l}</span>)}
          </div>

          <WaveformVisual seed={post.id} active={playing} className="mb-3 max-w-xs" />

          <div className="mt-auto flex flex-wrap items-center gap-2" data-no-play>
            <button onClick={handleLike} disabled={!user} className={`btn-secondary !rounded-full !px-4 !py-1.5 !text-xs ${liked ? '!text-accent' : ''}`}>
              {liked ? '♥' : '♡'} {likesCount}
            </button>
            <button onClick={handleSave} disabled={!user} className={`btn-secondary !rounded-full !px-4 !py-1.5 !text-xs ${saved ? '!text-accent' : ''}`}>
              {saved ? 'Saved' : 'Save'}
            </button>
            {user && !isOwner && (
              <button onClick={handleFollow} className={`btn-secondary !rounded-full !px-4 !py-1.5 !text-xs ${following ? '!text-accent' : ''}`}>
                {following ? 'Following' : 'Follow'}
              </button>
            )}
            <button onClick={handleAddToQueue} className="btn-secondary !rounded-full !px-4 !py-1.5 !text-xs" title="Add to queue">
              + Queue
            </button>
            <button onClick={toggleComments} className="btn-secondary !rounded-full !px-4 !py-1.5 !text-xs">
              Comment {showComments ? '▲' : ''}
            </button>
            {user && !isOwner && (
              <button onClick={(e) => { e.stopPropagation(); setShowCollab(true); }} className="btn-secondary !rounded-full !px-4 !py-1.5 !text-xs">
                Request Collab
              </button>
            )}
            {user && post.price > 0 && !isOwner && !post.owned && (
              <button onClick={handlePurchase} disabled={purchasing} className="btn-primary !rounded-full !px-4 !py-1.5 !text-xs">
                {purchasing ? '...' : 'Buy Beat'}
              </button>
            )}
            {post.owned && <span className="text-xs font-semibold text-success">Owned</span>}
            {isOwner && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setShowEdit(true); }} className="btn-secondary !rounded-full !px-4 !py-1.5 !text-xs">Edit</button>
                <button onClick={handleDelete} disabled={deleting} className="btn-secondary !rounded-full !px-4 !py-1.5 !text-xs !text-red-400">
                  {deleting ? '...' : 'Delete'}
                </button>
              </>
            )}
          </div>

          {showComments && (
            <div className="mt-3 border-t border-white/10 pt-3" data-no-play onClick={(e) => e.stopPropagation()}>
              {comments.length === 0 ? (
                <p className="text-xs text-text-secondary">No comments yet</p>
              ) : comments.map((c) => (
                <div key={c.id} className="mb-2 text-sm">
                  <span className="font-semibold">{c.username}</span>
                  <span className="ml-2 text-text-secondary">{c.content}</span>
                </div>
              ))}
              {user && (
                <form onSubmit={submitComment} className="mt-2 flex gap-2">
                  <input className="input !py-2 !text-sm flex-1" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                  <button type="submit" className="btn-primary !px-3 !text-xs">Post</button>
                </form>
              )}
            </div>
          )}
        </div>
      </article>

      {showCollab && <CollabRequestModal postId={post.id} onClose={() => setShowCollab(false)} />}
      {showEdit && <EditPostModal post={post} onClose={() => setShowEdit(false)} onSaved={onUpdate} />}
    </>
  );
}
