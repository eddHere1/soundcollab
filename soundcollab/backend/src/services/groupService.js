const pool = require('../config/db');

async function createGroup(creatorId, { name, memberIds = [] }) {
  const result = await pool.query(
    `INSERT INTO group_conversations (name, created_by) VALUES ($1, $2) RETURNING *`,
    [name, creatorId]
  );
  const group = result.rows[0];

  const members = new Set([creatorId, ...memberIds.map(Number)]);
  for (const uid of members) {
    await pool.query(
      `INSERT INTO group_conversation_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [group.id, uid]
    );
  }
  return group;
}

async function listGroups(userId) {
  const result = await pool.query(
    `SELECT g.*,
            (SELECT content FROM messages m WHERE m.group_id = g.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
            (SELECT COUNT(*)::int FROM group_conversation_members gm WHERE gm.group_id = g.id) AS member_count
     FROM group_conversations g
     JOIN group_conversation_members gm ON gm.group_id = g.id AND gm.user_id = $1
     ORDER BY g.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getGroupMessages(groupId, userId) {
  const member = await pool.query(
    'SELECT id FROM group_conversation_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  );
  if (!member.rows.length) throw { status: 403, message: 'Not a group member' };

  const messages = await pool.query(
    `SELECT m.*, u.username AS sender_username, u.profile_image AS sender_image
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.group_id = $1
     ORDER BY m.created_at ASC`,
    [groupId]
  );

  const members = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role
     FROM group_conversation_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1`,
    [groupId]
  );

  return { messages: messages.rows, members: members.rows };
}

async function sendGroupMessage(groupId, senderId, content, attachmentUrl = null, attachmentType = null) {
  const member = await pool.query(
    'SELECT id FROM group_conversation_members WHERE group_id = $1 AND user_id = $2',
    [groupId, senderId]
  );
  if (!member.rows.length) throw { status: 403, message: 'Not a group member' };

  const result = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, content, group_id, attachment_url, attachment_type)
     VALUES ($1, $1, $2, $3, $4, $5) RETURNING *`,
    [senderId, content || '', groupId, attachmentUrl, attachmentType]
  );
  return result.rows[0];
}

async function addMember(groupId, userId, newUserId) {
  const admin = await pool.query(
    'SELECT created_by FROM group_conversations WHERE id = $1',
    [groupId]
  );
  if (!admin.rows.length) throw { status: 404, message: 'Group not found' };
  if (admin.rows[0].created_by !== userId) throw { status: 403, message: 'Only creator can add members' };

  await pool.query(
    `INSERT INTO group_conversation_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [groupId, newUserId]
  );
}

module.exports = { createGroup, listGroups, getGroupMessages, sendGroupMessage, addMember };
