import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import { OPPORTUNITY_TYPES, GENRES } from '../constants/platform';

const TYPE_MAP = Object.fromEntries(OPPORTUNITY_TYPES.map((t) => [t.id, t]));

export default function Opportunities() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'need_rapper', title: '', description: '', genre_tags: [], is_paid: false, budget: '',
  });

  const load = () => {
    setLoading(true);
    const params = {};
    if (filter) params.type = filter;
    if (paidFilter) params.isPaid = paidFilter;
    if (genre) params.genre = genre;
    api.opportunities.list(params).then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, paidFilter, genre]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    await api.opportunities.create({
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
    });
    setShowForm(false);
    setForm({ type: 'need_rapper', title: '', description: '', genre_tags: [], is_paid: false, budget: '' });
    load();
  };

  const toggleGenre = (g) => {
    setForm((f) => ({
      ...f,
      genre_tags: f.genre_tags.includes(g) ? f.genre_tags.filter((x) => x !== g) : [...f.genre_tags, g],
    }));
  };

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold">Opportunities Hub</h1>
          <p className="mt-1 text-text-secondary">Find collabs, features, and open verses</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            Post Opportunity
          </button>
        )}
      </div>

      {showForm && user && (
        <form onSubmit={handleCreate} className="glass-card mb-8 space-y-4 !p-6">
          <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {OPPORTUNITY_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input min-h-[80px]" placeholder="Describe what you need..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex flex-wrap gap-2">
            {GENRES.slice(0, 6).map((g) => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${form.genre_tags.includes(g) ? 'bg-accent text-white' : 'glass'}`}>
                {g}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_paid} onChange={(e) => setForm({ ...form, is_paid: e.target.checked })} />
            Paid opportunity
          </label>
          {form.is_paid && (
            <input type="number" className="input" placeholder="Budget ($)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          )}
          <button type="submit" className="btn-primary">Publish</button>
        </form>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`rounded-full px-4 py-2 text-sm font-medium ${!filter ? 'bg-accent text-white' : 'glass'}`}>All</button>
        {OPPORTUNITY_TYPES.map((t) => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${filter === t.id ? 'bg-accent text-white' : 'glass'}`}>
            {t.tag}
          </button>
        ))}
        <select className="select !w-auto !py-2" value={paidFilter} onChange={(e) => setPaidFilter(e.target.value)}>
          <option value="">Paid & Free</option>
          <option value="true">Paid only</option>
          <option value="false">Free only</option>
        </select>
      </div>

      {loading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : items.length === 0 ? (
        <div className="glass-card py-16 text-center text-text-secondary">No opportunities yet. Be the first to post!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((opp) => (
            <div key={opp.id} className="glass-card !p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="pill-genre">{TYPE_MAP[opp.type]?.tag || opp.type}</span>
                {opp.is_paid ? (
                  <span className="pill bg-success/15 text-success">${Number(opp.budget || 0).toFixed(0)}</span>
                ) : (
                  <span className="pill bg-cyan/15 text-cyan">Free</span>
                )}
              </div>
              <h3 className="font-heading text-lg font-semibold">{opp.title}</h3>
              <Link to={`/profile/${opp.user_id}`} className="text-sm text-accent">{opp.username}</Link>
              {opp.description && <p className="mt-2 text-sm text-text-secondary line-clamp-2">{opp.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1">
                {opp.genre_tags?.map((g) => <span key={g} className="pill-genre !text-[10px]">{g}</span>)}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/profile/${opp.user_id}`} className="btn-secondary !text-xs">View Profile</Link>
                {user && user.id !== opp.user_id && (
                  <Link to={`/messages?user=${opp.user_id}`} className="btn-primary !text-xs">Request</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
