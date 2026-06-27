const pool = require('../config/db');
const notificationService = require('./notificationService');

const POST_JOINS = `
  FROM posts p
  JOIN users u ON u.id = p.user_id
  LEFT JOIN (
    SELECT post_id, COUNT(*)::int AS cnt FROM post_likes GROUP BY post_id
  ) lc ON lc.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*)::int AS cnt FROM post_comments GROUP BY post_id
  ) cc ON cc.post_id = p.id
`;

function postSelect(userParam = null) {
  let extraJoins = '';
  let extraCols = '';
  if (userParam) {
    extraJoins = `
      LEFT JOIN post_likes pl_me ON pl_me.post_id = p.id AND pl_me.user_id = ${userParam}
      LEFT JOIN saved_posts sp_me ON sp_me.post_id = p.id AND sp_me.user_id = ${userParam}
    `;
    extraCols = `, (pl_me.id IS NOT NULL) AS liked_by_me, (sp_me.id IS NOT NULL) AS saved_by_me`;
  }
  return `
    SELECT p.*, u.username, u.profile_image, u.role AS user_role,
           COALESCE(lc.cnt, 0) AS likes_count,
           COALESCE(cc.cnt, 0) AS comments_count
           ${extraCols}
    ${POST_JOINS}
    ${extraJoins}
  `;
}

const VALID_POST_TYPES = ['beat', 'song', 'loop', 'hook', 'sample_pack', 'drum_kit', 'service'];

async function createPost(userId, data) {
  const {
    type, title, audio_url, cover_image, description, genre_tags, looking_for, price,
    bpm, mood, open_verse, collab_open, marketplace_category,
  } = data;

  const result = await pool.query(
    `INSERT INTO posts (
      user_id, type, title, audio_url, cover_image, description, genre_tags, looking_for, price,
      bpm, mood, open_verse, collab_open, marketplace_category
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [
      userId,
      type,
      title,
      audio_url,
      cover_image || null,
      description || '',
      genre_tags || [],
      looking_for || [],
      price || null,
      bpm || null,
      mood || null,
      open_verse || false,
      collab_open || false,
      marketplace_category || null,
    ]
  );
  return result.rows[0];
}

async function updatePost(postId, userId, data) {
  const owner = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
  if (!owner.rows.length) throw { status: 404, message: 'Post not found' };
  if (owner.rows[0].user_id !== userId) throw { status: 403, message: 'Unauthorized' };

  const fields = [];
  const values = [];
  let i = 1;
  const allowed = [
    'title', 'description', 'genre_tags', 'looking_for', 'price', 'audio_url', 'cover_image', 'type',
    'bpm', 'mood', 'open_verse', 'collab_open', 'marketplace_category',
  ];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${i++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return getPostById(postId, userId);

  values.push(postId);
  const result = await pool.query(
    `UPDATE posts SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return getPostById(postId, userId);
}

async function getPostById(id, currentUserId = null) {
  const userParam = currentUserId ? '$2' : null;
  const result = await pool.query(
    `${postSelect(userParam)} WHERE p.id = $1`,
    currentUserId ? [id, currentUserId] : [id]
  );
  return result.rows[0] || null;
}

async function getFeed({
  type, genre, mood, lookingFor, followingOnly, userId, role,
  sort = 'newest', limit = 20, offset = 0, q,
}) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (type) {
    conditions.push(`p.type = $${i++}`);
    params.push(type);
  }
  if (genre) {
    conditions.push(`$${i++} = ANY(p.genre_tags)`);
    params.push(genre);
  }
  if (mood) {
    conditions.push(`p.mood = $${i++}`);
    params.push(mood);
  }
  if (lookingFor) {
    conditions.push(`$${i++} = ANY(p.looking_for)`);
    params.push(lookingFor);
  }
  if (followingOnly && userId) {
    conditions.push(`p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $${i++})`);
    params.push(userId);
  }
  if (role) {
    conditions.push(`u.role = $${i++}`);
    params.push(role);
  }
  if (q) {
    conditions.push(`(p.title ILIKE $${i} OR p.description ILIKE $${i} OR u.username ILIKE $${i})`);
    params.push(`%${q}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = sort === 'trending'
    ? 'ORDER BY COALESCE(lc.cnt, 0) DESC, p.created_at DESC'
    : 'ORDER BY p.created_at DESC';

  const userParam = userId ? `$${i}` : null;
  if (userId) params.push(userId);
  params.push(limit, offset);
  const limitIdx = userId ? i + 1 : i;
  const offsetIdx = userId ? i + 2 : i + 1;

  const result = await pool.query(
    `${postSelect(userParam)} ${where} ${orderBy} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );
  return result.rows;
}

async function getUserPosts(userId, currentUserId = null) {
  const userParam = currentUserId ? '$2' : null;
  const result = await pool.query(
    `${postSelect(userParam)} WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
    currentUserId ? [userId, currentUserId] : [userId]
  );
  return result.rows;
}

async function getSavedPosts(userId) {
  const result = await pool.query(
    `${postSelect('$1')}
     WHERE p.id IN (SELECT post_id FROM saved_posts WHERE user_id = $1)
     ORDER BY (SELECT created_at FROM saved_posts sp WHERE sp.post_id = p.id AND sp.user_id = $1) DESC`,
    [userId]
  );
  return result.rows;
}

async function getLikedPosts(userId) {
  const result = await pool.query(
    `${postSelect('$1')}
     WHERE p.id IN (SELECT post_id FROM post_likes WHERE user_id = $1)
     ORDER BY (SELECT created_at FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) DESC`,
    [userId]
  );
  return result.rows;
}

async function recordPlay(userId, postId) {
  if (!userId || !postId) return;
  await pool.query(
    'INSERT INTO play_history (user_id, post_id) VALUES ($1, $2)',
    [userId, postId]
  );
  await pool.query(
    `DELETE FROM play_history WHERE user_id = $1 AND id NOT IN (
      SELECT id FROM play_history WHERE user_id = $1 ORDER BY played_at DESC LIMIT 50
    )`,
    [userId]
  );
}

async function getRecentlyPlayed(userId, limit = 20) {
  const result = await pool.query(
    `${postSelect('$1')}
     WHERE p.id IN (
       SELECT DISTINCT ON (post_id) post_id FROM play_history
       WHERE user_id = $1 ORDER BY post_id, played_at DESC
     )
     ORDER BY (
       SELECT MAX(played_at) FROM play_history ph WHERE ph.post_id = p.id AND ph.user_id = $1
     ) DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

async function toggleLike(postId, userId) {
  const existing = await pool.query(
    'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );

  if (existing.rows.length > 0) {
    await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    return { liked: false };
  }

  await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);

  const post = await pool.query('SELECT user_id, title FROM posts WHERE id = $1', [postId]);
  if (post.rows.length) {
    await notificationService.create({
      userId: post.rows[0].user_id,
      type: 'like',
      actorId: userId,
      targetId: parseInt(postId),
      targetType: 'post',
      content: `liked your track "${post.rows[0].title}"`,
    });
  }

  return { liked: true };
}

async function toggleSave(postId, userId) {
  const existing = await pool.query(
    'SELECT id FROM saved_posts WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );

  if (existing.rows.length > 0) {
    await pool.query('DELETE FROM saved_posts WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    return { saved: false };
  }

  await pool.query('INSERT INTO saved_posts (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
  return { saved: true };
}

async function addComment(postId, userId, content) {
  const result = await pool.query(
    `INSERT INTO post_comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [postId, userId, content]
  );
  const user = await pool.query('SELECT username, profile_image FROM users WHERE id = $1', [userId]);
  const comment = { ...result.rows[0], ...user.rows[0] };

  const post = await pool.query('SELECT user_id, title FROM posts WHERE id = $1', [postId]);
  if (post.rows.length) {
    await notificationService.create({
      userId: post.rows[0].user_id,
      type: 'comment',
      actorId: userId,
      targetId: parseInt(postId),
      targetType: 'post',
      content: content.slice(0, 120),
    });
  }

  return comment;
}

async function getComments(postId) {
  const result = await pool.query(
    `SELECT c.*, u.username, u.profile_image
     FROM post_comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows;
}

async function deletePost(postId, userId) {
  const result = await pool.query(
    'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id',
    [postId, userId]
  );
  if (!result.rows.length) throw { status: 404, message: 'Post not found or unauthorized' };
}

module.exports = {
  VALID_POST_TYPES,
  createPost,
  updatePost,
  getPostById,
  getFeed,
  getUserPosts,
  getSavedPosts,
  getLikedPosts,
  getRecentlyPlayed,
  recordPlay,
  toggleLike,
  toggleSave,
  addComment,
  getComments,
  deletePost,
};
