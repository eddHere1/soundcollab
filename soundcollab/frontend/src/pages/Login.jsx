import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(`/profile/${u.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base px-4">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[120px]" />

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
          <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">Log in to your producer dashboard</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input type="email" className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            No account? <Link to="/register" className="font-semibold text-accent hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
