import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, mediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import PostCard from '../components/music/PostCard';
import { getCoverGradient } from '../utils/coverArt';

import { BADGE_LABELS } from '../constants/platform';

const ROLES = ['artist', 'producer', 'both', 'engineer'];
const GENRES = ['Trap', 'Drill', 'R&B', 'Hip-Hop', 'Pop', 'Lo-Fi', 'Afrobeats', 'EDM', 'Rock', 'Soul'];

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', role: 'artist', location: '', genres: [] });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [tab, setTab] = useState('tracks');
  const [collabRequests, setCollabRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTip, setShowTip] = useState(false);
  const [tipAmount, setTipAmount] = useState('5');
  const [tipMessage, setTipMessage] = useState('');
  const [tipSending, setTipSending] = useState(false);
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const isOwn = currentUser && parseInt(id) === currentUser.id;

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.users.get(id);
      setProfile(data);
      setForm({
        bio: data.bio || '',
        role: data.role || 'artist',
        location: data.location || '',
        genres: data.genres || [],
      });
      if (isOwn || data.is_friend) {
        try {
          const incoming = await api.collab.incoming();
          setCollabRequests(incoming.filter((r) => r.post_owner_id === parseInt(id) || r.requester_id === parseInt(id)));
        } catch { setCollabRequests([]); }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [id]);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
  }, [avatarPreview, bannerPreview]);

  const handleFollow = async () => {
    try {
      if (profile.is_following) await api.follows.unfollow(id);
      else await api.follows.follow(id);
      loadProfile();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFriendAction = async () => {
    try {
      if (profile.is_friend) {
        await api.friends.remove(id);
      } else if (profile.request_status === 'incoming') {
        await api.friends.accept({ userId: parseInt(id) });
      } else if (profile.request_status === 'outgoing') {
        return;
      } else {
        await api.friends.request(parseInt(id));
      }
      loadProfile();
    } catch (err) {
      alert(err.message);
    }
  };

  const friendButtonLabel = () => {
    if (profile.is_friend) return 'Friends';
    if (profile.request_status === 'incoming') return 'Accept Request';
    if (profile.request_status === 'outgoing') return 'Request Sent';
    return 'Add Friend';
  };

  const toggleGenre = (genre) => {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(genre) ? f.genres.filter((g) => g !== genre) : [...f.genres, genre],
    }));
  };

  const pickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const pickBanner = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const body = new FormData();
    body.append('bio', form.bio);
    body.append('role', form.role);
    body.append('location', form.location);
    body.append('genres', JSON.stringify(form.genres));
    if (avatarFile) body.append('profileImage', avatarFile);
    if (bannerFile) body.append('bannerImage', bannerFile);
    await api.users.update(id, body);
    setEditing(false);
    setAvatarFile(null);
    setBannerFile(null);
    setAvatarPreview(null);
    setBannerPreview(null);
    loadProfile();
  };

  const cancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setBannerFile(null);
    setAvatarPreview(null);
    setBannerPreview(null);
  };

  const handleMessage = () => {
    if (profile.is_friend) {
      navigate(`/messages?user=${id}`);
      return;
    }
    if (profile.request_status === 'outgoing') {
      alert('Friend request pending — once they accept, you can message each other.');
      return;
    }
    if (profile.request_status === 'incoming') {
      handleFriendAction().then(() => navigate(`/messages?user=${id}`));
      return;
    }
    if (window.confirm('You need to be friends to DM. Send a friend request now?')) {
      handleFriendAction();
    }
  };

  const sendTip = async (e) => {
    e.preventDefault();
    const amount = parseFloat(tipAmount);
    if (!amount || amount <= 0) return alert('Enter a valid tip amount');
    setTipSending(true);
    try {
      await api.users.tip(id, { amount, message: tipMessage });
      setShowTip(false);
      setTipMessage('');
      alert(`Tip of $${amount.toFixed(2)} sent to ${profile.username}!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setTipSending(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-spotify-muted">Loading...</div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="py-24 text-center text-spotify-muted">User not found</div>
      </AppShell>
    );
  }

  const bannerGradient = getCoverGradient(profile.username);
  const bannerSrc = bannerPreview || (profile.banner_image ? mediaUrl(profile.banner_image) : null);
  const avatarSrc = avatarPreview || (profile.profile_image ? mediaUrl(profile.profile_image) : null);

  const statCards = [
    ['Uploads', profile.stats.uploads],
    ['Likes', profile.stats.total_likes],
    ['Collabs', profile.stats.collabs],
    ['Sales', profile.stats.sales],
  ];
  if (isOwn) {
    statCards.push(['Revenue', `$${Number(profile.stats.revenue || 0).toFixed(0)}`]);
  }

  const visibleStats = profile.stats
    ? Object.entries(profile.stats).filter(([k]) => isOwn || k !== 'revenue')
    : [];

  return (
    <AppShell>
      {/* Banner */}
      <div className="relative -mx-4 mb-6 sm:-mx-6 sm:-mt-6 sm:mb-8">
        <div
          className="h-32 w-full bg-cover bg-center sm:h-52"
          style={bannerSrc ? { backgroundImage: `url(${bannerSrc})` } : { background: bannerGradient }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-spotify-base via-spotify-base/60 to-transparent" />
        {editing && (
          <>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={pickBanner} />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-black/70 sm:right-6 sm:top-4 sm:px-4 sm:py-2 sm:text-sm"
            >
              Change banner
            </button>
          </>
        )}
        <div className="absolute bottom-0 left-3 flex flex-col items-start gap-2 pb-3 sm:left-6 sm:flex-row sm:items-end sm:gap-6 sm:pb-4">
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={profile.username}
                className="h-20 w-20 shrink-0 rounded-full border-4 border-spotify-base object-cover shadow-card sm:h-40 sm:w-40"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-spotify-base bg-spotify-highlight text-3xl font-black shadow-card sm:h-40 sm:w-40 sm:text-5xl">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            {editing && (
              <>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <div className="mb-0 min-w-0 sm:mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-spotify-muted sm:text-sm">Artist</p>
            <h1 className="text-2xl font-black sm:text-4xl">{profile.username}</h1>
            <p className="mt-0.5 capitalize text-sm text-spotify-muted sm:mt-1">{profile.role}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex gap-4 text-sm sm:gap-6">
          <span><strong className="text-white">{profile.followers_count}</strong> <span className="text-spotify-muted">followers</span></span>
          <span><strong className="text-white">{profile.following_count}</strong> <span className="text-spotify-muted">following</span></span>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.genres?.map((g) => <span key={g} className="pill-genre">{g}</span>)}
          {profile.badges?.map((b) => (
            <span key={b} className="pill bg-accent/20 text-accent">{BADGE_LABELS[b] || b}</span>
          ))}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          {isOwn ? (
            <button onClick={() => (editing ? cancelEdit() : setEditing(true))} className="btn-secondary !text-sm">
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          ) : currentUser ? (
            <>
              <button onClick={() => setShowTip(true)} className="btn-cyan !text-sm">
                Send Tip
              </button>
              <button onClick={handleFriendAction} className={
                profile.is_friend || profile.request_status === 'incoming'
                  ? 'btn-primary !text-sm'
                  : profile.request_status === 'outgoing'
                    ? 'btn-secondary !text-sm opacity-70'
                    : 'btn-primary !text-sm'
              } disabled={profile.request_status === 'outgoing' && !profile.is_friend}>
                {friendButtonLabel()}
              </button>
              <button onClick={handleMessage} className="btn-secondary !text-sm">
                Send DM
              </button>
              <button onClick={handleFollow} className="btn-secondary !text-sm">
                {profile.is_following ? 'Following' : 'Follow'}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {profile.bio && !editing && (
        <p className="mb-8 max-w-2xl text-spotify-muted">{profile.bio}</p>
      )}

      {editing && (
        <div className="mb-8 max-w-xl space-y-4 rounded-xl bg-spotify-elevated p-6">
          <textarea className="input min-h-[80px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" />
          <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${form.genres.includes(g) ? 'bg-accent text-white' : 'bg-spotify-highlight text-spotify-muted'}`}>
                {g}
              </button>
            ))}
          </div>
          <button onClick={handleSave} className="btn-primary">Save</button>
        </div>
      )}

      {profile.stats && (
        <div className={`mb-8 grid gap-3 ${isOwn ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {statCards.map(([label, val]) => (
            <div key={label} className="glass-card !p-3 text-center">
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="font-heading text-lg font-bold">{val ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {['tracks', 'collabs', ...(isOwn ? ['stats'] : [])].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-bold capitalize ${tab === t ? 'bg-accent text-white' : 'glass'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && isOwn && profile.stats && (
        <div className="glass-card mb-8 !p-6">
          <h2 className="section-title mb-4">Creator Stats</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {visibleStats.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                <dt className="capitalize text-text-secondary">{k.replace(/_/g, ' ')}</dt>
                <dd className="font-semibold">{typeof v === 'number' && k === 'revenue' ? `$${v.toFixed(2)}` : v}</dd>
              </div>
            ))}
          </dl>
          <Link to="/dashboard" className="btn-primary mt-6 inline-flex">Open Creator Dashboard</Link>
        </div>
      )}

      {tab === 'collabs' && (
        <div className="mb-8">
          <h2 className="section-title mb-4">Collaborations</h2>
          {collabRequests.length === 0 ? (
            <div className="glass-card py-12 text-center text-text-secondary">No collab activity yet</div>
          ) : (
            <div className="space-y-3">
              {collabRequests.map((r) => (
                <div key={r.id} className="glass-card !p-4">
                  <p className="font-semibold">{r.requester_username || r.username}</p>
                  <p className="text-sm text-text-secondary">on &ldquo;{r.post_title}&rdquo; — {r.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'tracks' && (
        <>
      <h2 className="mb-4 text-2xl font-bold">Discography</h2>
      {profile.posts?.length === 0 ? (
        <div className="rounded-lg bg-spotify-elevated py-16 text-center text-spotify-muted">No tracks yet</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {profile.posts.map((post) => (
            <PostCard key={post.id} post={post} variant="grid" queue={profile.posts} onUpdate={loadProfile} />
          ))}
        </div>
      )}
        </>
      )}
      {showTip && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={sendTip} className="glass-card w-full max-w-sm !p-6">
            <h3 className="mb-1 font-heading text-xl font-bold">Tip {profile.username}</h3>
            <p className="mb-4 text-sm text-text-secondary">Support this creator directly</p>
            <div className="mb-3 flex gap-2">
              {['3', '5', '10', '20'].map((a) => (
                <button key={a} type="button" onClick={() => setTipAmount(a)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold ${tipAmount === a ? 'bg-accent text-white' : 'glass text-text-secondary'}`}>
                  ${a}
                </button>
              ))}
            </div>
            <input type="number" step="0.01" min="1" className="input mb-3" placeholder="Custom amount" value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} required />
            <textarea className="input mb-4 min-h-[60px]" placeholder="Optional message..." value={tipMessage} onChange={(e) => setTipMessage(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowTip(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={tipSending} className="btn-primary flex-1">{tipSending ? 'Sending...' : 'Send Tip'}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
