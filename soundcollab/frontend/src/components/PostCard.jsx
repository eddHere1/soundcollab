import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import AudioPlayer from './AudioPlayer';
import CollabRequestModal from './CollabRequestModal';

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me || false);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count) || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showCollab, setShowCollab] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    try {
      await api.posts.like(post.id);
      setLiked(!liked);
      setLikesCount((c) => (liked ? c - 1 : c + 1));
    } catch (err) {
      alert(err.message);
    }
  };

  const loadComments = async () => {
    if (!showComments && comments.length === 0) {
      const data = await api.posts.comments(post.id);
      setComments(data);
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const c = await api.posts.addComment(post.id, commentText);
    setComments([...comments, c]);
    setCommentText('');
  };

  const handlePurchase = async () => {
    if (!user) return;
    setPurchasing(true);
    try {
      await api.beats.purchase(post.id);
      alert('Beat purchased! (mock transaction)');
      onUpdate?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <article className="card overflow-hidden">
      <div className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <Link to={`/profile/${post.user_id}`}>
            <Avatar src={post.profile_image} username={post.username} />
          </Link>
          <div>
            <Link to={`/profile/${post.user_id}`} className="font-semibold hover:text-brand-300">
              {post.username}
            </Link>
            <p className="text-xs text-dark-400">
              {new Date(post.created_at).toLocaleDateString()} ·{' '}
              <span className={post.type === 'beat' ? 'text-emerald-400' : 'text-blue-400'}>
                {post.type}
              </span>
            </p>
          </div>
          {post.price && (
            <span className="ml-auto rounded-lg bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-300">
              ${Number(post.price).toFixed(2)}
            </span>
          )}
        </div>

        <h3 className="mb-2 font-display text-lg font-semibold">{post.title}</h3>
        {post.description && <p className="mb-3 text-sm text-dark-300">{post.description}</p>}

        <div className="mb-3 flex flex-wrap gap-1.5">
          {post.genre_tags?.map((g) => (
            <span key={g} className="tag-genre">{g}</span>
          ))}
          {post.looking_for?.map((l) => (
            <span key={l} className="tag-looking">🔍 {l}</span>
          ))}
        </div>

        <AudioPlayer src={post.audio_url} />
      </div>

      <div className="flex items-center gap-1 border-t border-dark-700 px-5 py-3">
        <button
          onClick={handleLike}
          disabled={!user}
          className={`btn-ghost gap-1.5 ${liked ? 'text-red-400' : ''}`}
        >
          {liked ? '♥' : '♡'} {likesCount}
        </button>
        <button onClick={loadComments} className="btn-ghost gap-1.5">
          💬 {post.comments_count || 0}
        </button>
        {user && user.id !== post.user_id && (
          <button onClick={() => setShowCollab(true)} className="btn-ghost gap-1.5">
            🤝 Collab
          </button>
        )}
        {user && post.price && post.user_id !== user.id && !post.owned && (
          <button onClick={handlePurchase} disabled={purchasing} className="btn-primary ml-auto text-xs">
            {purchasing ? '...' : 'Buy Beat'}
          </button>
        )}
        {post.owned && (
          <span className="ml-auto text-xs text-emerald-400">✓ Owned</span>
        )}
      </div>

      {showComments && (
        <div className="border-t border-dark-700 px-5 py-4">
          {comments.map((c) => (
            <div key={c.id} className="mb-3 flex gap-2">
              <Avatar src={c.profile_image} username={c.username} size="sm" />
              <div>
                <span className="text-sm font-medium">{c.username}</span>
                <p className="text-sm text-dark-300">{c.content}</p>
              </div>
            </div>
          ))}
          {user && (
            <form onSubmit={submitComment} className="mt-3 flex gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" className="btn-primary text-xs">Post</button>
            </form>
          )}
        </div>
      )}

      {showCollab && (
        <CollabRequestModal postId={post.id} onClose={() => setShowCollab(false)} />
      )}
    </article>
  );
}
