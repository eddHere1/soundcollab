import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import { FriendCard } from '../components/social/SocialUI';

export default function Friends() {
  const { user } = useAuth();
  const [tab, setTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, r] = await Promise.all([api.friends.list(), api.friends.requests()]);
      setFriends(f);
      setRequests(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      api.users.search(search).then(setSearchResults).catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  if (!user) return <Navigate to="/login" />;

  const handleAccept = async (req) => {
    await api.friends.accept({ requestId: req.request_id });
    load();
  };

  const handleReject = async (req) => {
    await api.friends.reject({ requestId: req.request_id });
    load();
  };

  const handleAddFriend = async (userId) => {
    try {
      await api.friends.request(userId);
      alert('Friend request sent!');
    } catch (err) {
      alert(err.message);
    }
  };

  const friendIds = new Set(friends.map((f) => f.id));

  return (
    <AppShell>
      <header className="mb-8">
        <h1 className="text-3xl font-black">Friends</h1>
        <p className="mt-1 text-spotify-muted">Connect with artists and producers</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'friends', label: `Friends (${friends.length})` },
          { id: 'requests', label: `Requests (${requests.length})` },
          { id: 'find', label: 'Find People' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`btn text-sm ${tab === id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-spotify-muted">Loading...</div>
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <div className="rounded-xl bg-spotify-elevated py-16 text-center">
            <p className="text-spotify-muted">No friends yet</p>
            <button onClick={() => setTab('find')} className="btn-primary mt-4 text-sm">
              Find People
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((f) => (
              <FriendCard
                key={f.id}
                user={f}
                actions={
                  <>
                    <Link to={`/messages?user=${f.id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
                      Message
                    </Link>
                    <button
                      onClick={async () => { await api.friends.remove(f.id); load(); }}
                      className="btn-ghost !px-3 !py-1.5 text-xs text-red-400"
                    >
                      Remove
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )
      ) : tab === 'requests' ? (
        requests.length === 0 ? (
          <div className="rounded-xl bg-spotify-elevated py-16 text-center text-spotify-muted">
            No pending requests
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {requests.map((req) => (
              <FriendCard
                key={req.request_id}
                user={req}
                actions={
                  <>
                    <button onClick={() => handleAccept(req)} className="btn-primary !px-3 !py-1.5 text-xs">
                      Accept
                    </button>
                    <button onClick={() => handleReject(req)} className="btn-secondary !px-3 !py-1.5 text-xs">
                      Decline
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )
      ) : (
        <div>
          <input
            className="input mb-6 max-w-md"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {searchResults
              .filter((u) => u.id !== user.id)
              .map((u) => (
                <FriendCard
                  key={u.id}
                  user={u}
                  actions={
                    friendIds.has(u.id) ? (
                      <span className="text-xs text-spotify-green">Friends</span>
                    ) : (
                      <button onClick={() => handleAddFriend(u.id)} className="btn-primary !px-3 !py-1.5 text-xs">
                        Add Friend
                      </button>
                    )
                  }
                />
              ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
