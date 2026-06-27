const pool = require('../config/db');

async function getUserPlaylists(userId) {
  const result = await pool.query(
    `SELECT pl.*,
            (SELECT COUNT(*)::int FROM playlist_items pi WHERE pi.playlist_id = pl.id) AS item_count
     FROM playlists pl WHERE pl.user_id = $1 ORDER BY pl.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getPlaylist(id, userId) {
  const pl = await pool.query('SELECT * FROM playlists WHERE id = $1', [id]);
  if (!pl.rows.length) throw { status: 404, message: 'Playlist not found' };
  const playlist = pl.rows[0];
  if (!playlist.is_public && playlist.user_id !== userId) {
    throw { status: 403, message: 'Private playlist' };
  }

  const items = await pool.query(
    `SELECT p.*, u.username, u.profile_image, pi.position
     FROM playlist_items pi
     JOIN posts p ON p.id = pi.post_id
     JOIN users u ON u.id = p.user_id
     WHERE pi.playlist_id = $1
     ORDER BY pi.position ASC, pi.added_at ASC`,
    [id]
  );

  return { ...playlist, items: items.rows };
}

async function create(userId, { name, description, is_public }) {
  const result = await pool.query(
    `INSERT INTO playlists (user_id, name, description, is_public)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, name, description || '', is_public || false]
  );
  return result.rows[0];
}

async function addItem(playlistId, userId, postId) {
  const owner = await pool.query(
    'SELECT user_id FROM playlists WHERE id = $1',
    [playlistId]
  );
  if (!owner.rows.length) throw { status: 404, message: 'Playlist not found' };
  if (owner.rows[0].user_id !== userId) throw { status: 403, message: 'Unauthorized' };

  const pos = await pool.query(
    'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM playlist_items WHERE playlist_id = $1',
    [playlistId]
  );
  await pool.query(
    `INSERT INTO playlist_items (playlist_id, post_id, position)
     VALUES ($1, $2, $3) ON CONFLICT (playlist_id, post_id) DO NOTHING`,
    [playlistId, postId, pos.rows[0].next]
  );
  return getPlaylist(playlistId, userId);
}

async function removeItem(playlistId, userId, postId) {
  const owner = await pool.query(
    'SELECT user_id FROM playlists WHERE id = $1',
    [playlistId]
  );
  if (!owner.rows.length) throw { status: 404, message: 'Playlist not found' };
  if (owner.rows[0].user_id !== userId) throw { status: 403, message: 'Unauthorized' };

  await pool.query(
    'DELETE FROM playlist_items WHERE playlist_id = $1 AND post_id = $2',
    [playlistId, postId]
  );
  return getPlaylist(playlistId, userId);
}

module.exports = { getUserPlaylists, getPlaylist, create, addItem, removeItem };
