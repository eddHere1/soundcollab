const pool = require('../config/db');
const notificationService = require('./notificationService');

async function sendTip(senderId, receiverId, amount, message = '') {
  if (senderId === receiverId) throw { status: 400, message: 'Cannot tip yourself' };
  if (!amount || amount <= 0) throw { status: 400, message: 'Invalid tip amount' };

  const user = await pool.query('SELECT id, username FROM users WHERE id = $1', [receiverId]);
  if (!user.rows.length) throw { status: 404, message: 'User not found' };

  const result = await pool.query(
    `INSERT INTO tips (sender_id, receiver_id, amount, message) VALUES ($1, $2, $3, $4) RETURNING *`,
    [senderId, receiverId, amount, message || '']
  );

  try {
    await notificationService.create({
      userId: receiverId,
      type: 'tip',
      actorId: senderId,
      targetId: result.rows[0].id,
      targetType: 'tip',
      content: `Sent you a $${amount.toFixed(2)} tip${message ? `: ${message}` : ''}`,
    });
  } catch { /* optional */ }

  return result.rows[0];
}

module.exports = { sendTip };
