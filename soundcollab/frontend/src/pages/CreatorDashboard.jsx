import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.analytics.dashboard().then(setData).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <Link to="/login" className="btn-primary">Log in for creator tools</Link>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return <AppShell><p className="text-text-secondary">Loading dashboard...</p></AppShell>;
  }

  const { plan_tier, stats, premium_features } = data || {};

  return (
    <AppShell>
      <h1 className="mb-2 font-heading text-3xl font-extrabold">Creator Dashboard</h1>
      <p className="mb-8 text-text-secondary">
        Plan: <span className="capitalize text-accent">{plan_tier || 'free'}</span>
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Uploads', value: stats?.uploads },
          { label: 'Total Likes', value: stats?.total_likes },
          { label: 'Followers', value: stats?.followers },
          { label: 'Sales', value: stats?.sales },
          { label: 'Revenue', value: `$${Number(stats?.revenue || 0).toFixed(2)}` },
          { label: 'Plays', value: stats?.plays },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card !p-5">
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="font-heading text-2xl font-bold">{value ?? 0}</p>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-4">Premium Features</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { key: 'boosted_uploads', label: 'Boosted Uploads', desc: 'Priority placement in feeds' },
          { key: 'analytics', label: 'Creator Analytics', desc: 'Deep insights on plays & engagement' },
          { key: 'monetization_dashboard', label: 'Monetization', desc: 'Sales tracking & payouts prep' },
        ].map(({ key, label, desc }) => (
          <div key={key} className={`glass-card !p-5 ${premium_features?.[key] ? 'border-accent/40' : 'opacity-60'}`}>
            <p className="font-semibold">{label}</p>
            <p className="mt-1 text-sm text-text-secondary">{desc}</p>
            <span className={`mt-3 inline-block text-xs font-bold ${premium_features?.[key] ? 'text-success' : 'text-text-secondary'}`}>
              {premium_features?.[key] ? 'Active' : 'Upgrade to unlock'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/" className="btn-secondary">View Pricing Plans</Link>
      </div>
    </AppShell>
  );
}
