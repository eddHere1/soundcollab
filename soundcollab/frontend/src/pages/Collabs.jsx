import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';

export default function Collabs() {
  const { user } = useAuth();
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [inc, my] = await Promise.all([api.collab.incoming(), api.collab.mine()]);
    setIncoming(inc);
    setMine(my);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);
  if (!user) return <Navigate to="/login" />;

  const respond = async (id, status) => {
    await api.collab.respond(id, status);
    load();
  };

  const requests = tab === 'incoming' ? incoming : mine;

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-black">Collab Requests</h1>
      <div className="mb-6 flex gap-2">
        <button onClick={() => setTab('incoming')} className={`btn text-sm ${tab === 'incoming' ? 'btn-primary' : 'btn-secondary'}`}>
          Incoming ({incoming.filter((r) => r.status === 'pending').length})
        </button>
        <button onClick={() => setTab('mine')} className={`btn text-sm ${tab === 'mine' ? 'btn-primary' : 'btn-secondary'}`}>My Requests</button>
      </div>
      {loading ? <p className="text-spotify-muted">Loading...</p> : requests.length === 0 ? (
        <div className="rounded-xl bg-spotify-elevated py-16 text-center text-spotify-muted">No requests</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="surface !rounded-xl p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-bold">{tab === 'incoming' ? r.requester_username : r.post_owner}</p>
                <span className={`pill ${r.status === 'pending' ? 'pill-looking' : r.status === 'accepted' ? 'pill-beat' : 'bg-red-500/20 text-red-400'}`}>{r.status}</span>
              </div>
              <p className="text-sm text-spotify-muted">on &ldquo;{r.post_title}&rdquo;</p>
              <p className="mt-2 text-sm">{r.message}</p>
              {tab === 'incoming' && r.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => respond(r.id, 'accepted')} className="btn-primary text-sm">Accept</button>
                  <button onClick={() => respond(r.id, 'rejected')} className="btn-secondary text-sm">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
