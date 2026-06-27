const pool = require('../config/db');
const friendService = require('./friendService');
const notificationService = require('./notificationService');

async function getOrCreateConversation(userId1, userId2) {
  const a = Math.min(userId1, userId2);
  const b = Math.max(userId1, userId2);
  let result = await pool.query(
    'SELECT * FROM conversations WHERE participant_a = $1 AND participant_b = $2',
    [a, b]
  );
  if (!result.rows.length) {
    result = await pool.query(
      'INSERT INTO conversations (participant_a, participant_b) VALUES ($1, $2) RETURNING *',
      [a, b]
    );
  }
  return result.rows[0];
}

async function sendMessage({ senderId, receiverId, content, collabThreadId = null, conversationId = null, attachmentUrl = null, attachmentType = null }) {
  if (!collabThreadId) {
    const friends = await friendService.areFriends(senderId, receiverId);
    if (!friends) throw { status: 403, message: 'You can only message friends' };
  }

  let convId = conversationId;
  if (!collabThreadId && !convId) {
    const conv = await getOrCreateConversation(senderId, receiverId);
    convId = conv.id;
  }

  const result = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, content, collab_thread_id, conversation_id, attachment_url, attachment_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [senderId, receiverId, content || '', collabThreadId, convId, attachmentUrl, attachmentType]
  );

  if (convId) {
    await pool.query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [convId]);
  }

  if (!collabThreadId) {
    await notificationService.create({
      userId: receiverId,
      type: 'message',
      actorId: senderId,
      targetId: convId,
      targetType: 'conversation',
      content: content.slice(0, 120),
    });
  }

  return result.rows[0];
}

async function getConversationById(conversationId, userId) {
  const conv = await pool.query('SELECT * FROM conversations WHERE id = $1', [conversationId]);
  if (!conv.rows.length) throw { status: 404, message: 'Conversation not found' };
  const { participant_a, participant_b } = conv.rows[0];
  const uid = Number(userId);
  const a = Number(participant_a);
  const b = Number(participant_b);
  if (uid !== a && uid !== b) {
    throw { status: 403, message: 'Not a participant' };
  }

  const result = await pool.query(
    `SELECT m.*, s.username as sender_username, s.profile_image as sender_image
     FROM messages m
     JOIN users s ON s.id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC`,
    [conversationId]
  );

  const otherId = uid === a ? b : a;
  await pool.query(
    `UPDATE messages SET read_at = NOW()
     WHERE conversation_id = $1 AND receiver_id = $2 AND read_at IS NULL`,
    [conversationId, uid]
  );

  const other = await pool.query(
    'SELECT id, username, profile_image, role FROM users WHERE id = $1',
    [otherId]
  );
  if (!other.rows.length) throw { status: 404, message: 'Other user not found' };

  return {
    conversation_id: conv.rows[0].id,
    conversation: conv.rows[0],
    other_user: other.rows[0],
    messages: result.rows,
  };
}

async function getConversation(userId, otherUserId) {
  const friends = await friendService.areFriends(userId, otherUserId);
  if (!friends) throw { status: 403, message: 'You can only message friends' };

  const conv = await getOrCreateConversation(userId, otherUserId);
  return getConversationById(conv.id, userId);
}

async function getCollabThreadMessages(threadId, userId) {
  const memberCheck = await pool.query(
    'SELECT id FROM collab_thread_members WHERE thread_id = $1 AND user_id = $2',
    [threadId, userId]
  );
  if (!memberCheck.rows.length) throw { status: 403, message: 'Not a member of this thread' };

  const result = await pool.query(
    `SELECT m.*, s.username as sender_username, s.profile_image as sender_image
     FROM messages m
     JOIN users s ON s.id = m.sender_id
     WHERE m.collab_thread_id = $1
     ORDER BY m.created_at ASC`,
    [threadId]
  );
  return result.rows;
}

async function getConversations(userId) {
  const uid = Number(userId);
  const result = await pool.query(
    `SELECT * FROM conversations
     WHERE participant_a = $1 OR participant_b = $1
     ORDER BY updated_at DESC`,
    [uid]
  );

  const rows = [];
  for (const c of result.rows) {
    const otherId = Number(c.participant_a) === uid ? Number(c.participant_b) : Number(c.participant_a);
    const userRes = await pool.query(
      'SELECT id, username, profile_image, role FROM users WHERE id = $1',
      [otherId]
    );
    if (!userRes.rows.length) continue;

    const last = await pool.query(
      'SELECT content FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1',
      [c.id]
    );
    const unread = await pool.query(
      'SELECT COUNT(*)::int AS c FROM messages WHERE conversation_id = $1 AND receiver_id = $2 AND read_at IS NULL',
      [c.id, uid]
    );

    const u = userRes.rows[0];
    rows.push({
      conversation_id: c.id,
      last_message_at: c.updated_at,
      other_user_id: u.id,
      username: u.username,
      profile_image: u.profile_image,
      role: u.role,
      last_message: last.rows[0]?.content || null,
      unread_count: unread.rows[0]?.c || 0,
    });
  }
  return rows;
}

async function getInbox(userId) {
  return getConversations(userId);
}

async function getCollabThreads(userId) {
  const result = await pool.query(
    `SELECT ct.id as thread_id, ct.post_id, ct.created_at,
            p.title as post_title, p.type as post_type,
            u.username as post_owner
     FROM collab_threads ct
     JOIN collab_thread_members ctm ON ctm.thread_id = ct.id
     JOIN posts p ON p.id = ct.post_id
     JOIN users u ON u.id = p.user_id
     WHERE ctm.user_id = $1
     ORDER BY ct.created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = {
  sendMessage,
  getOrCreateConversation,
  getConversationById,
  getConversation,
  getCollabThreadMessages,
  getConversations,
  getInbox,
  getCollabThreads,
};
