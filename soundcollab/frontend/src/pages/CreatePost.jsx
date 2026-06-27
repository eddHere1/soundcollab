import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Layout from '../components/Layout';

const GENRES = ['Trap', 'Drill', 'R&B', 'Hip-Hop', 'Pop', 'Lo-Fi', 'Afrobeats', 'EDM', 'Rock', 'Soul'];
const LOOKING_FOR = ['vocalist', 'collab', 'feedback'];

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'beat', title: '', description: '', price: '', genre_tags: [], looking_for: [],
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
    if (!audio) { setError('Please select an audio file'); return; }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('genre_tags', JSON.stringify(form.genre_tags));
      formData.append('looking_for', JSON.stringify(form.looking_for));
      if (form.price) formData.append('price', form.price);
      formData.append('audio', audio);

      await api.posts.create(formData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 font-display text-2xl font-bold">Upload {form.type === 'beat' ? 'Beat' : 'Song'}</h1>

        <div className="card p-6">
          {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-2">
              {['beat', 'song'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`btn flex-1 capitalize ${form.type === t ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm text-dark-300">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <label className="mb-1 block text-sm text-dark-300">Description</label>
              <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="mb-1 block text-sm text-dark-300">Audio file</label>
              <input type="file" accept="audio/*" className="text-sm text-dark-300" onChange={(e) => setAudio(e.target.files[0])} required />
            </div>

            {form.type === 'beat' && (
              <div>
                <label className="mb-1 block text-sm text-dark-300">Price (optional — for marketplace)</label>
                <input type="number" step="0.01" min="0" className="input" placeholder="29.99" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-dark-300">Genre tags</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button key={g} type="button" onClick={() => toggle('genre_tags', g)}
                    className={`tag ${form.genre_tags.includes(g) ? 'tag-genre ring-1 ring-brand-400' : 'bg-dark-700 text-dark-400'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-dark-300">Looking for</label>
              <div className="flex flex-wrap gap-2">
                {LOOKING_FOR.map((l) => (
                  <button key={l} type="button" onClick={() => toggle('looking_for', l)}
                    className={`tag ${form.looking_for.includes(l) ? 'tag-looking ring-1 ring-amber-400' : 'bg-dark-700 text-dark-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Uploading...' : 'Publish'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
