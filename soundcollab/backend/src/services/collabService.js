const pool = require('../config/db');
const notificationService = require('./notificationService');

async function createRequest({ postId, requesterId, message, attachmentUrl }) {
  const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
  if (!post.rows.length) throw { status: 404, message: 'Post not found' };
  if (post.rows[0].user_id === requesterId) {
    throw { status: 400, message: 'Cannot request collab on your own post' };
  }

  try {
    const result = await pool.query(
      `INSERT INTO collab_requests (post_id, requester_id, message, attachment_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [postId, requesterId, message, attachmentUrl || null]
    );
    const request = result.rows[0];
    await notificationService.create({
      userId: post.rows[0].user_id,
      type: 'collab_request',
      actorId: requesterId,
      targetId: request.id,
      targetType: 'collab_request',
      content: message.slice(0, 120),
    });
    return request;
  } catch (err) {
    if (err.code === '23505') throw { status: 400, message: 'You already sent a request for this post' };
    throw err;
  }
}

async function getRequestsForPost(postId, ownerId) {
  const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
  if (!post.rows.length) throw { status: 404, message: 'Post not found' };
  if (post.rows[0].user_id !== ownerId) throw { status: 403, message: 'Unauthorized' };

  const result = await pool.query(
    `SELECT cr.*, u.username, u.profile_image, u.role
     FROM collab_requests cr
     JOIN users u ON u.id = cr.requester_id
     WHERE cr.post_id = $1
     ORDER BY cr.created_at DESC`,
    [postId]
  );
  return result.rows;
}

async function getMyRequests(userId) {
  const result = await pool.query(
    `SELECT cr.*, p.title as post_title, p.type as post_type,
            u.username as post_owner, u.profile_image as post_owner_image
     FROM collab_requests cr
     JOIN posts p ON p.id = cr.post_id
     JOIN users u ON u.id = p.user_id
     WHERE cr.requester_id = $1
     ORDER BY cr.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getIncomingRequests(userId) {
  const result = await pool.query(
    `SELECT cr.*, p.title as post_title, p.type as post_type,
            u.username as requester_username, u.profile_image as requester_image
     FROM collab_requests cr
     JOIN posts p ON p.id = cr.post_id
     JOIN users u ON u.id = cr.requester_id
     WHERE p.user_id = $1
     ORDER BY cr.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function respondToRequest(requestId, ownerId, status) {
  if (!['accepted', 'rejected'].includes(status)) {
    throw { status: 400, message: 'Status must be accepted or rejected' };
  }

  const req = await pool.query(
    `SELECT cr.*, p.user_id as post_owner_id
     FROM collab_requests cr
     JOIN posts p ON p.id = cr.post_id
     WHERE cr.id = $1`,
    [requestId]
  );
  if (!req.rows.length) throw { status: 404, message: 'Request not found' };
  if (req.rows[0].post_owner_id !== ownerId) throw { status: 403, message: 'Unauthorized' };
  if (req.rows[0].status !== 'pending') throw { status: 400, message: 'Request already responded to' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let threadId = null;
    if (status === 'accepted') {
      const thread = await client.query(
        'INSERT INTO collab_threads (post_id) VALUES ($1) RETURNING id',
        [req.rows[0].post_id]
      );
      threadId = thread.rows[0].id;

      await client.query(
        'INSERT INTO collab_thread_members (thread_id, user_id) VALUES ($1, $2), ($1, $3)',
        [threadId, ownerId, req.rows[0].requester_id]
      );
    }

    const updated = await client.query(
      'UPDATE collab_requests SET status = $1, thread_id = $2 WHERE id = $3 RETURNING *',
      [status, threadId, requestId]
    );

    await client.query('COMMIT');
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createRequest,
  getRequestsForPost,
  getMyRequests,
  getIncomingRequests,
  respondToRequest,
};
