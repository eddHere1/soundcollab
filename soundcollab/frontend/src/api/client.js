const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  health: () => request('/health'),
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  users: {
    get: (id) => request(`/users/${id}`),
    update: (id, body) => request(`/users/${id}`, { method: 'PUT', body }),
    search: (q, params = {}) => request(`/users/search?q=${encodeURIComponent(q || '')}${params.role ? `&role=${params.role}` : ''}`),
    suggested: () => request('/users/suggested'),
    stats: (id) => request(`/users/${id}/stats`),
    tip: (id, body) => request(`/users/${id}/tip`, { method: 'POST', body: JSON.stringify(body) }),
  },
  posts: {
    feed: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/posts/feed?${qs}`);
    },
    saved: () => request('/posts/saved'),
    liked: () => request('/posts/liked'),
    recent: () => request('/posts/recent'),
    recordPlay: (id) => request(`/posts/${id}/play`, { method: 'POST' }),
    get: (id) => request(`/posts/${id}`),
    create: (formData) => request('/posts', { method: 'POST', body: formData }),
    update: (id, body) => {
      if (body instanceof FormData) {
        return request(`/posts/${id}`, { method: 'PUT', body });
      }
      return request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    like: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
    save: (id) => request(`/posts/${id}/save`, { method: 'POST' }),
    comments: (id) => request(`/posts/${id}/comments`),
    addComment: (id, content) =>
      request(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  },
  follows: {
    follow: (id) => request(`/follows/${id}`, { method: 'POST' }),
    unfollow: (id) => request(`/follows/${id}`, { method: 'DELETE' }),
  },
  friends: {
    request: (userId) =>
      request('/friends/request', { method: 'POST', body: JSON.stringify({ userId }) }),
    accept: (body) =>
      request('/friends/accept', { method: 'POST', body: JSON.stringify(body) }),
    reject: (body) =>
      request('/friends/reject', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request('/friends/list'),
    requests: () => request('/friends/requests'),
    remove: (id) => request(`/friends/${id}`, { method: 'DELETE' }),
  },
  messages: {
    conversations: () => request('/messages/conversations'),
    get: (conversationId) => request(`/messages/${conversationId}`),
    send: (body) => {
      if (body instanceof FormData) {
        return request('/messages', { method: 'POST', body });
      }
      return request('/messages', { method: 'POST', body: JSON.stringify(body) });
    },
    conversation: (userId) => request(`/messages/dm/${userId}`),
    collabThreads: () => request('/messages/collab-threads'),
    collabMessages: (threadId) => request(`/messages/collab/${threadId}`),
    sendCollabMessage: (threadId, receiverId, content) =>
      request(`/messages/collab/${threadId}`, {
        method: 'POST',
        body: JSON.stringify({ receiverId, content }),
      }),
  },
  notifications: {
    list: () => request('/notifications'),
    unreadCount: () => request('/notifications/unread-count'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  },
  collab: {
    request: (postId, formData) =>
      request(`/collab/${postId}`, { method: 'POST', body: formData }),
    incoming: () => request('/collab/incoming'),
    mine: () => request('/collab/mine'),
    respond: (id, status) =>
      request(`/collab/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  beats: {
    marketplace: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/beats?${qs}`);
    },
    purchase: (postId) => request(`/beats/${postId}/purchase`, { method: 'POST' }),
    purchases: () => request('/beats/purchases'),
    sales: () => request('/beats/sales'),
  },
  opportunities: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/opportunities?${qs}`);
    },
    create: (body) => request('/opportunities', { method: 'POST', body: JSON.stringify(body) }),
    get: (id) => request(`/opportunities/${id}`),
    close: (id) => request(`/opportunities/${id}/close`, { method: 'PATCH' }),
  },
  charts: {
    get: (limit = 10) => request(`/charts?limit=${limit}`),
  },
  playlists: {
    list: () => request('/playlists'),
    get: (id) => request(`/playlists/${id}`),
    create: (body) => request('/playlists', { method: 'POST', body: JSON.stringify(body) }),
    addItem: (id, postId) =>
      request(`/playlists/${id}/items`, { method: 'POST', body: JSON.stringify({ postId }) }),
    removeItem: (id, postId) =>
      request(`/playlists/${id}/items/${postId}`, { method: 'DELETE' }),
  },
  analytics: {
    dashboard: () => request('/analytics/dashboard'),
  },
  groups: {
    list: () => request('/groups'),
    create: (body) => {
      if (body instanceof FormData) {
        return request('/groups', { method: 'POST', body });
      }
      return request('/groups', { method: 'POST', body: JSON.stringify(body) });
    },
    messages: (id) => request(`/groups/${id}/messages`),
    send: (id, body) => {
      if (body instanceof FormData) {
        return request(`/groups/${id}/messages`, { method: 'POST', body });
      }
      return request(`/groups/${id}/messages`, { method: 'POST', body: JSON.stringify(body) });
    },
    addMember: (id, userId) =>
      request(`/groups/${id}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  },
};

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
}
