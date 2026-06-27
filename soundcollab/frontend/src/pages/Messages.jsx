import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { api, mediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';
import { ConversationRow, UserAvatar } from '../components/social/SocialUI';

export default function Messages() {
  const { user } = useAuth();
  const { conversationId: paramConvId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [threads, setThreads] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeConvId, setActiveConvId] = useState(paramConvId ? parseInt(paramConvId) : null);
  const [activeThread, setActiveThread] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [chat, setChat] = useState({ other_user: null, messages: [], members: [] });
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [tab, setTab] = useState('dm');
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [friends, setFriends] = useState([]);
  const [opening, setOpening] = useState(false);
  const bottomRef = useRef(null);

  const loadInbox = useCallback(async () => {
    const [convos, collab, groupList] = await Promise.all([
      api.messages.conversations(),
      api.messages.collabThreads(),
      api.groups.list().catch(() => []),
    ]);
    setConversations(convos);
    setThreads(collab);
    setGroups(groupList);
    return convos;
  }, []);

  const loadChat = useCallback(async (convId) => {
    const data = await api.messages.get(convId);
    if (data?.other_user) {
      setChat({ other_user: data.other_user, messages: data.messages || [], members: [] });
    } else {
      setChat((c) => ({ ...c, messages: data?.messages || [] }));
    }
    return data;
  }, []);

  const loadGroupChat = useCallback(async (groupId) => {
    const data = await api.groups.messages(groupId);
    setChat({ other_user: null, messages: data.messages, members: data.members || [] });
  }, []);

  const openDmWithUser = useCallback(async (userId, knownFriend = null) => {
    const uid = parseInt(userId, 10);
    if (!Number.isFinite(uid)) return;
    setOpening(true);
    setTab('dm');
    setActiveThread(null);
    setActiveGroupId(null);
    try {
      const data = await api.messages.conversation(uid);

      // Legacy API returned a bare messages array
      const messages = Array.isArray(data) ? data : (data.messages || []);
      let convId = data?.conversation_id ?? data?.conversation?.id ?? null;
      let otherUser = data?.other_user ?? knownFriend ?? null;

      if (!convId) {
        const convos = await api.messages.conversations();
        const match = convos.find((c) => Number(c.other_user_id) === uid);
        if (match) {
          convId = match.conversation_id;
          if (!otherUser) {
            otherUser = {
              id: uid,
              username: match.username,
              role: match.role,
              profile_image: match.profile_image,
            };
          }
        }
      }

      if (!convId) {
        throw new Error('Could not open conversation. Restart the backend server and try again.');
      }

      if (!otherUser) {
        const full = await api.messages.get(convId);
        otherUser = full.other_user;
        setActiveConvId(convId);
        setChat({ other_user: otherUser, messages: full.messages || messages, members: [] });
      } else {
        setActiveConvId(convId);
        setChat({ other_user: otherUser, messages, members: [] });
      }

      await loadInbox().catch(() => {});
    } catch (err) {
      alert(err.message || 'Could not open conversation');
    } finally {
      setOpening(false);
    }
  }, [loadInbox]);

  useEffect(() => {
    if (!user) return;
    loadInbox();
    api.friends.list().then(setFriends).catch(() => setFriends([]));
  }, [user, loadInbox]);

  useEffect(() => {
    const userId = searchParams.get('user');
    if (!user || !userId) return;
    openDmWithUser(userId).then(() => {
      searchParams.delete('user');
      setSearchParams(searchParams, { replace: true });
    });
  }, [user, searchParams, openDmWithUser, setSearchParams]);

  useEffect(() => {
    if (paramConvId) {
      setTab('dm');
      setActiveConvId(parseInt(paramConvId, 10));
    }
  }, [paramConvId]);

  useEffect(() => {
    if (!user || !activeConvId || tab !== 'dm') return;
    if (chat.other_user && chat.messages.length >= 0) {
      // Already loaded via openDmWithUser; still poll for new messages
    }
    loadChat(activeConvId).catch(() => {});
    const interval = setInterval(() => loadChat(activeConvId).catch(() => {}), 5000);
    return () => clearInterval(interval);
  }, [activeConvId, tab, user, loadChat]);

  useEffect(() => {
    if (!user || !activeThread || tab !== 'collab') return;
    api.messages.collabMessages(activeThread).then((msgs) =>
      setChat((c) => ({ ...c, messages: msgs }))
    );
  }, [activeThread, tab, user]);

  useEffect(() => {
    if (!user || !activeGroupId || tab !== 'groups') return;
    loadGroupChat(activeGroupId);
    const interval = setInterval(() => loadGroupChat(activeGroupId), 5000);
    return () => clearInterval(interval);
  }, [activeGroupId, tab, user, loadGroupChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  if (!user) return <Navigate to="/login" />;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    if (tab === 'dm' && (activeConvId || chat.other_user)) {
      try {
        if (attachment) {
          const fd = new FormData();
          if (activeConvId) fd.append('conversationId', activeConvId);
          if (chat.other_user?.id) fd.append('receiverId', chat.other_user.id);
          fd.append('content', text || 'Sent an attachment');
          fd.append('attachment', attachment);
          await api.messages.send(fd);
          setAttachment(null);
        } else {
          await api.messages.send({
            conversationId: activeConvId || undefined,
            receiverId: chat.other_user?.id,
            content: text,
          });
        }
        setText('');
        if (activeConvId) {
          await loadChat(activeConvId);
        } else if (chat.other_user?.id) {
          await openDmWithUser(chat.other_user.id);
        }
        loadInbox();
      } catch (err) {
        alert(err.message || 'Failed to send message');
      }
    } else if (tab === 'collab' && activeThread) {
      const other = chat.messages.find((m) => m.sender_id !== user.id);
      await api.messages.sendCollabMessage(activeThread, other?.sender_id || chat.other_user?.id, text);
      setText('');
      const msgs = await api.messages.collabMessages(activeThread);
      setChat((c) => ({ ...c, messages: msgs }));
    } else if (tab === 'groups' && activeGroupId) {
      if (attachment) {
        const fd = new FormData();
        fd.append('content', text || 'Sent an attachment');
        fd.append('attachment', attachment);
        await api.groups.send(activeGroupId, fd);
        setAttachment(null);
      } else {
        await api.groups.send(activeGroupId, { content: text });
      }
      setText('');
      await loadGroupChat(activeGroupId);
      loadInbox();
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const memberIds = groupMembers
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => Number.isFinite(n) && n !== user.id);
    await api.groups.create({ name: groupName.trim(), memberIds });
    setGroupName('');
    setGroupMembers('');
    setShowNewGroup(false);
    await loadInbox();
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const hasActiveChat =
    (tab === 'dm' && activeConvId && chat.other_user) ||
    (tab === 'collab' && activeThread) ||
    (tab === 'groups' && activeGroupId);

  const closeMobileChat = () => {
    setActiveConvId(null);
    setActiveThread(null);
    setActiveGroupId(null);
    setChat({ other_user: null, messages: [], members: [] });
  };

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-black sm:mb-6 sm:text-3xl">Messages</h1>

      <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {[
          { id: 'dm', label: 'DMs' },
          { id: 'collab', label: 'Collabs' },
          { id: 'groups', label: 'Groups' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              if (id === 'dm') { setActiveThread(null); setActiveGroupId(null); }
              if (id === 'collab') { setActiveConvId(null); setActiveGroupId(null); closeMobileChat(); }
              if (id === 'groups') { setActiveConvId(null); setActiveThread(null); closeMobileChat(); }
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${tab === id ? 'bg-accent text-white' : 'glass'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex min-h-[calc(100dvh-14rem)] flex-col overflow-hidden rounded-xl border border-white/5 bg-spotify-elevated md:min-h-[420px] md:flex-row md:h-[calc(100vh-280px)]">
        {/* Inbox — full width on mobile until chat opens */}
        <div className={`w-full shrink-0 overflow-y-auto border-white/10 md:w-80 md:border-r ${hasActiveChat ? 'hidden md:block' : 'block'}`}>
          {tab === 'dm' ? (
            <>
              {friends.length > 0 && (
                <div className="border-b border-white/10 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Message a friend</p>
                  <div className="flex flex-wrap gap-1.5">
                    {friends.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => openDmWithUser(f.id, f)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          chat.other_user?.id === f.id ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'
                        }`}
                      >
                        {f.username}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-spotify-muted">No conversations yet</p>
                  {friends.length === 0 ? (
                    <Link to="/friends" className="mt-2 inline-block text-sm text-accent hover:underline">
                      Add friends to message
                    </Link>
                  ) : (
                    <p className="mt-2 text-xs text-text-secondary">Tap a friend above to start chatting</p>
                  )}
                </div>
              ) : (
                conversations.map((item) => (
                  <ConversationRow
                    key={item.conversation_id}
                    item={item}
                    active={activeConvId === item.conversation_id}
                    onClick={() => {
                      setActiveConvId(item.conversation_id);
                      setTab('dm');
                      setChat({ other_user: null, messages: [], members: [] });
                    }}
                  />
                ))
              )}
            </>
          ) : tab === 'collab' ? (
            threads.length === 0 ? (
              <p className="p-4 text-sm text-spotify-muted">No collab threads</p>
            ) : (
              threads.map((t) => (
                <button
                  key={t.thread_id}
                  onClick={() => setActiveThread(t.thread_id)}
                  className={`w-full p-4 text-left transition hover:bg-spotify-highlight ${
                    activeThread === t.thread_id ? 'bg-spotify-highlight' : ''
                  }`}
                >
                  <p className="text-sm font-semibold">{t.post_title}</p>
                  <p className="text-xs text-spotify-muted">with {t.post_owner}</p>
                </button>
              ))
            )
          ) : (
            <>
              <div className="border-b border-white/10 p-3">
                <button
                  onClick={() => setShowNewGroup(!showNewGroup)}
                  className="btn-primary w-full !text-sm"
                >
                  {showNewGroup ? 'Cancel' : 'New Group'}
                </button>
                {showNewGroup && (
                  <form onSubmit={createGroup} className="mt-3 space-y-2">
                    <input
                      className="input w-full text-sm"
                      placeholder="Group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                    <input
                      className="input w-full text-sm"
                      placeholder="Member IDs (comma-separated)"
                      value={groupMembers}
                      onChange={(e) => setGroupMembers(e.target.value)}
                    />
                    <p className="text-[10px] text-spotify-muted">
                      Or pick friends: {friends.slice(0, 5).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setGroupMembers((m) => (m ? `${m},${f.id}` : String(f.id)))}
                          className="mr-1 text-accent hover:underline"
                        >
                          {f.username}
                        </button>
                      ))}
                    </p>
                    <button type="submit" className="btn-secondary w-full !text-sm">Create</button>
                  </form>
                )}
              </div>
              {groups.length === 0 ? (
                <p className="p-4 text-sm text-spotify-muted">No groups yet</p>
              ) : (
                groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroupId(g.id)}
                    className={`w-full p-4 text-left transition hover:bg-spotify-highlight ${
                      activeGroupId === g.id ? 'bg-spotify-highlight' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold">{g.name}</p>
                    <p className="truncate text-xs text-spotify-muted">
                      {g.member_count || 0} members
                      {g.last_message ? ` · ${g.last_message}` : ''}
                    </p>
                  </button>
                ))
              )}
            </>
          )}
        </div>

        {/* Chat */}
        <div className={`min-h-0 flex-1 flex-col ${hasActiveChat ? 'flex' : 'hidden md:flex'}`}>
          {opening ? (
            <div className="flex flex-1 items-center justify-center text-text-secondary">Opening chat...</div>
          ) : hasActiveChat ? (
            <>
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3 sm:px-5 sm:py-4">
                <button
                  type="button"
                  onClick={closeMobileChat}
                  className="btn-ghost touch-target !p-2 md:hidden"
                  aria-label="Back to inbox"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                {tab === 'dm' && chat.other_user && (
                  <>
                    <UserAvatar user={chat.other_user} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/profile/${chat.other_user.id}`} className="truncate font-bold hover:underline">
                        {chat.other_user.username}
                      </Link>
                      <p className="text-xs capitalize text-spotify-muted">{chat.other_user.role}</p>
                    </div>
                  </>
                )}
                {tab === 'collab' && (
                  <p className="font-semibold">
                    {threads.find((t) => t.thread_id === activeThread)?.post_title}
                  </p>
                )}
                {tab === 'groups' && activeGroup && (
                  <div>
                    <p className="font-bold">{activeGroup.name}</p>
                    <p className="text-xs text-spotify-muted">
                      {chat.members.length || activeGroup.member_count || 0} members
                    </p>
                  </div>
                )}
              </div>

              {tab === 'groups' && chat.members.length > 0 && (
                <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-5 py-2">
                  {chat.members.map((m) => (
                    <Link key={m.id} to={`/profile/${m.id}`} className="flex shrink-0 items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-xs hover:bg-white/10">
                      {m.profile_image ? (
                        <img src={mediaUrl(m.profile_image)} alt="" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/30 text-[10px] font-bold">
                          {m.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                      {m.username}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {chat.messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-text-secondary">
                    <p className="text-sm">No messages yet</p>
                    <p className="mt-1 text-xs">Say hello to {chat.other_user?.username || 'them'}!</p>
                  </div>
                ) : (
                  chat.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${tab === 'groups' && m.sender_id !== user.id ? 'flex gap-2' : ''}`}>
                        {tab === 'groups' && m.sender_id !== user.id && (
                          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold">
                            {(m.sender_username || '?')[0]?.toUpperCase()}
                          </span>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm ${
                            m.sender_id === user.id
                              ? 'bg-accent text-white'
                              : 'bg-spotify-highlight text-white'
                          }`}
                        >
                          {tab === 'groups' && m.sender_id !== user.id && (
                            <p className="mb-0.5 text-[10px] font-semibold text-cyan">{m.sender_username}</p>
                          )}
                          {m.content}
                          {m.attachment_url && (
                            <a href={mediaUrl(m.attachment_url)} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline opacity-80">
                              {m.attachment_type === 'audio' ? '🎵 Audio attachment' : '📎 File attachment'}
                            </a>
                          )}
                          <p className={`mt-1 text-[10px] ${m.sender_id === user.id ? 'text-white/60' : 'text-spotify-muted'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="flex flex-col gap-2 border-t border-white/10 p-3 sm:flex-row sm:p-4">
                <input type="file" accept="audio/*,.zip,.pdf" className="w-full text-xs sm:w-24" onChange={(e) => setAttachment(e.target.files[0])} />
                <input
                  className="input min-w-0 flex-1 text-base sm:text-sm"
                  placeholder={tab === 'groups' ? 'Message the group...' : `Message ${chat.other_user?.username || '...'}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="btn-primary shrink-0 text-sm">Send</button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-spotify-muted">
              <svg className="mb-4 h-12 w-12 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.96L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation or friend to start chatting</p>
              {friends.length > 0 && (
                <p className="mt-2 text-xs text-text-secondary">Use the friend chips in the left panel</p>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
