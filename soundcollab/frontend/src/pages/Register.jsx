import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = ['artist', 'producer', 'both', 'engineer'];
const GENRES = ['Trap', 'Drill', 'R&B', 'Hip-Hop', 'Pop', 'Lo-Fi', 'Afrobeats', 'EDM'];

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'artist', genres: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" />;

  const toggleGenre = (genre) => {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(genre) ? f.genres.filter((g) => g !== genre) : [...f.genres, genre],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newUser = await register(form);
      navigate(`/profile/${newUser.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan/10 blur-[120px]" />

      <div className="relative w-full max-w-md animate-slide-up">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
            <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
            </svg>
          </div>
          <span className="font-heading text-2xl font-bold">
            Sound<span className="text-accent">Collab</span>
          </span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="font-heading text-2xl font-bold">Join the movement</h1>
          <p className="mt-1 text-sm text-text-secondary">Create your producer account in seconds</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            <input type="email" className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input type="password" className="input" placeholder="Password (6+ chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    form.genres.includes(g)
                      ? 'bg-accent text-white shadow-glow'
                      : 'glass text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? 'Creating...' : 'Sign Up Free'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Have an account? <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
