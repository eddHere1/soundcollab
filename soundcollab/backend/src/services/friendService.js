const pool = require('../config/db');
const notificationService = require('./notificationService');

async function areFriends(userId, otherId) {
  const result = await pool.query(
    'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
    [userId, otherId]
  );
  return result.rows.length > 0;
}

async function getFriendStatus(viewerId, targetId) {
  if (!viewerId || viewerId === targetId) return { is_friend: false, request_status: null, request_id: null };

  const friendship = await pool.query(
    'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
    [viewerId, targetId]
  );
  if (friendship.rows.length) {
    return { is_friend: true, request_status: 'accepted', request_id: null };
  }

  const incoming = await pool.query(
    `SELECT id, status FROM friend_requests
     WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'`,
    [targetId, viewerId]
  );
  if (incoming.rows.length) {
    return { is_friend: false, request_status: 'incoming', request_id: incoming.rows[0].id };
  }

  const outgoing = await pool.query(
    `SELECT id, status FROM friend_requests
     WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'`,
    [viewerId, targetId]
  );
  if (outgoing.rows.length) {
    return { is_friend: false, request_status: 'outgoing', request_id: outgoing.rows[0].id };
  }

  return { is_friend: false, request_status: null, request_id: null };
}

async function sendRequest(senderId, receiverId) {
  if (senderId === receiverId) throw { status: 400, message: 'Cannot friend yourself' };

  const existing = await areFriends(senderId, receiverId);
  if (existing) throw { status: 400, message: 'Already friends' };

  try {
    const result = await pool.query(
      `INSERT INTO friend_requests (sender_id, receiver_id, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [senderId, receiverId]
    );
    const request = result.rows[0];
    await notificationService.create({
      userId: receiverId,
      type: 'friend_request',
      actorId: senderId,
      targetId: request.id,
      targetType: 'friend_request',
      content: 'sent you a friend request',
    });
    return request;
  } catch (err) {
    if (err.code === '23505') throw { status: 400, message: 'Friend request already exists' };
    throw err;
  }
}

async function acceptRequest(userId, { requestId, senderId }) {
  let request;
  if (requestId) {
    const result = await pool.query(
      `SELECT * FROM friend_requests WHERE id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [requestId, userId]
    );
    request = result.rows[0];
  } else if (senderId) {
    const result = await pool.query(
      `SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'`,
      [senderId, userId]
    );
    request = result.rows[0];
  }
  if (!request) throw { status: 404, message: 'Friend request not found' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE friend_requests SET status = 'accepted' WHERE id = $1`,
      [request.id]
    );
    await client.query(
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2), ($2, $1) ON CONFLICT DO NOTHING',
      [request.sender_id, request.receiver_id]
    );
    await client.query('COMMIT');
    return { accepted: true, friend_id: request.sender_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function rejectRequest(userId, { requestId, senderId }) {
  let result;
  if (requestId) {
    result = await pool.query(
      `UPDATE friend_requests SET status = 'rejected'
       WHERE id = $1 AND receiver_id = $2 AND status = 'pending' RETURNING *`,
      [requestId, userId]
    );
  } else if (senderId) {
    result = await pool.query(
      `UPDATE friend_requests SET status = 'rejected'
       WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending' RETURNING *`,
      [senderId, userId]
    );
  }
  if (!result?.rows?.length) throw { status: 404, message: 'Friend request not found' };
  return { rejected: true };
}

async function listFriends(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role, u.bio, f.created_at as friends_since
     FROM friendships f
     JOIN users u ON u.id = f.friend_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function listIncomingRequests(userId) {
  const result = await pool.query(
    `SELECT fr.id as request_id, fr.created_at, u.id, u.username, u.profile_image, u.role
     FROM friend_requests fr
     JOIN users u ON u.id = fr.sender_id
     WHERE fr.receiver_id = $1 AND fr.status = 'pending'
     ORDER BY fr.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function removeFriend(userId, friendId) {
  await pool.query(
    'DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
    [userId, friendId]
  );
  return { removed: true };
}

module.exports = {
  areFriends,
  getFriendStatus,
  sendRequest,
  acceptRequest,
  rejectRequest,
  listFriends,
  listIncomingRequests,
  removeFriend,
};
