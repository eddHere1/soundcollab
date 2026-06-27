import { useState } from 'react';
import { api } from '../../api/client';

const GENRES = ['Trap', 'Drill', 'R&B', 'Hip-Hop', 'Pop', 'Lo-Fi', 'Afrobeats', 'EDM', 'Rock', 'Soul'];
const LOOKING_FOR = ['vocalist', 'collab', 'feedback'];

export default function EditPostModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: post.type,
    title: post.title,
    description: post.description || '',
    price: post.price || '',
    genre_tags: post.genre_tags || [],
    looking_for: post.looking_for || [],
  });
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (audio) {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('type', form.type);
        fd.append('description', form.description);
        fd.append('genre_tags', JSON.stringify(form.genre_tags));
        fd.append('looking_for', JSON.stringify(form.looking_for));
        if (form.price) fd.append('price', form.price);
        fd.append('audio', audio);
        await api.posts.update(post.id, fd);
      } else {
        await api.posts.update(post.id, {
          title: form.title,
          type: form.type,
          description: form.description,
          genre_tags: form.genre_tags,
          looking_for: form.looking_for,
          price: form.price || null,
        });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-spotify-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-xl font-bold">Edit Track</h3>
        {error && <div className="mb-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button key={g} type="button" onClick={() => toggle('genre_tags', g)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${form.genre_tags.includes(g) ? 'bg-accent text-white' : 'bg-spotify-highlight text-spotify-muted'}`}>
                {g}
              </button>
            ))}
          </div>
          <select className="select" value={form.looking_for[0] || ''} onChange={(e) => setForm({ ...form, looking_for: e.target.value ? [e.target.value] : [] })}>
            <option value="">Not specified</option>
            {LOOKING_FOR.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          {form.type === 'beat' && (
            <input type="number" step="0.01" className="input" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          )}
          <div>
            <label className="mb-1 block text-xs text-spotify-muted">Replace audio (optional)</label>
            <input type="file" accept="audio/*" className="text-sm text-spotify-muted" onChange={(e) => setAudio(e.target.files[0])} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
