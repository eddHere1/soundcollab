import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import AppShell from '../components/layout/AppShell';
import { GENRES, MOODS, UPLOAD_TYPES, LOOKING_FOR } from '../constants/platform';

export default function Upload() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'beat', title: '', description: '', price: '', bpm: '', mood: '',
    genre_tags: [], looking_for: [], open_verse: false, collab_open: false,
    marketplace_category: '',
  });
  const [audio, setAudio] = useState(null);
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const toggle = (field, value) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  };

  const handleFile = (file) => { if (file) setAudio(file); };

  const handleCover = (file) => {
    if (!file) return;
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audio) { setError('Please select a file'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'genre_tags' || k === 'looking_for') {
          formData.append(k, JSON.stringify(v));
        } else if (typeof v === 'boolean') {
          formData.append(k, String(v));
        } else if (v !== '' && v != null) {
          formData.append(k, v);
        }
      });
      formData.append('audio', audio);
      if (cover) formData.append('coverImage', cover);
      await api.posts.create(formData);
      navigate('/library');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isMarketplaceType = ['beat', 'hook', 'loop', 'sample_pack', 'drum_kit'].includes(form.type);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 font-heading text-3xl font-extrabold">Upload Studio</h1>
        <p className="mb-8 text-text-secondary">Drop your sound. Add cover art. Tag it. Set your price.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {UPLOAD_TYPES.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setForm({ ...form, type: id })}
                className={`rounded-xl py-3 text-sm font-semibold transition ${form.type === id ? 'bg-accent text-white shadow-glow' : 'glass text-text-primary'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              className={`glass-card border-2 border-dashed p-8 text-center ${dragOver ? 'border-accent' : 'border-white/10'}`}
            >
              {audio ? (
                <p className="font-semibold text-accent">{audio.name}</p>
              ) : (
                <>
                  <p className="font-semibold text-text-primary">Audio file</p>
                  <p className="mt-1 text-sm text-text-secondary">MP3, WAV, OGG, ZIP</p>
                </>
              )}
              <input type="file" accept="audio/*,.zip" className="mt-4 w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:text-white" onChange={(e) => handleFile(e.target.files[0])} />
            </div>

            <div className="glass-card border-2 border-dashed border-white/10 p-8 text-center">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="mx-auto mb-3 h-32 w-32 rounded-xl object-cover" />
              ) : (
                <>
                  <p className="font-semibold text-text-primary">Cover art</p>
                  <p className="mt-1 text-sm text-text-secondary">JPG, PNG, WEBP</p>
                </>
              )}
              <input type="file" accept="image/*" className="mt-4 w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:text-white" onChange={(e) => handleCover(e.target.files[0])} />
            </div>
          </div>

          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">BPM</label>
              <input type="number" className="input" placeholder="140" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">Mood</label>
              <select className="select" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>
                <option value="">Select mood</option>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-secondary">Genre tags</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button key={g} type="button" onClick={() => toggle('genre_tags', g)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${form.genre_tags.includes(g) ? 'bg-accent text-white' : 'glass text-text-secondary'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-secondary">Looking for</label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR.map((l) => (
                <button key={l} type="button" onClick={() => toggle('looking_for', l)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${form.looking_for.includes(l) ? 'bg-cyan/20 text-cyan' : 'glass text-text-secondary'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-text-primary">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.open_verse} onChange={(e) => setForm({ ...form, open_verse: e.target.checked })} className="accent-accent" />
              Open verse available
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.collab_open} onChange={(e) => setForm({ ...form, collab_open: e.target.checked })} className="accent-accent" />
              Open to collaboration
            </label>
          </div>

          {isMarketplaceType && (
            <input type="number" step="0.01" min="0" className="input" placeholder="Price (optional) — list on marketplace" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-4">
            {loading ? 'Uploading...' : 'Publish'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
