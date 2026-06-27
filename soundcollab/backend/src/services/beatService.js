const pool = require('../config/db');

const MARKETPLACE_CATEGORIES = [
  'beats', 'hooks', 'loops', 'drum_kits', 'mixing_mastering', 'songwriting',
];

const CATEGORY_TYPE_MAP = {
  beats: ['beat'],
  hooks: ['hook'],
  loops: ['loop'],
  drum_kits: ['drum_kit', 'sample_pack'],
  mixing_mastering: ['service'],
  songwriting: ['service', 'song'],
};

async function purchaseItem(postId, buyerId) {
  const post = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
  if (!post.rows.length) throw { status: 404, message: 'Item not found' };
  const item = post.rows[0];
  if (!item.price || item.price <= 0) throw { status: 400, message: 'This item is not for sale' };
  if (item.user_id === buyerId) throw { status: 400, message: 'Cannot buy your own item' };

  const existing = await pool.query(
    'SELECT id FROM beat_sales WHERE post_id = $1 AND buyer_id = $2',
    [postId, buyerId]
  );
  if (existing.rows.length) throw { status: 400, message: 'You already own this item' };

  const result = await pool.query(
    `INSERT INTO beat_sales (post_id, buyer_id, seller_id, price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [postId, buyerId, item.user_id, item.price]
  );
  return { sale: result.rows[0], item };
}

async function getMarketplace({ category, genre, mood, limit = 20, offset = 0 }) {
  const params = [];
  let i = 1;
  const conditions = ['p.price IS NOT NULL', 'p.price > 0'];

  if (category && CATEGORY_TYPE_MAP[category]) {
    const types = CATEGORY_TYPE_MAP[category];
    conditions.push(`p.type = ANY($${i++})`);
    params.push(types);
  } else {
    conditions.push(`p.type IN ('beat', 'hook', 'loop', 'drum_kit', 'sample_pack', 'service')`);
  }

  if (genre) {
    conditions.push(`$${i++} = ANY(p.genre_tags)`);
    params.push(genre);
  }
  if (mood) {
    conditions.push(`p.mood = $${i++}`);
    params.push(mood);
  }

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT p.*, u.username, u.profile_image, u.role AS user_role
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return result.rows;
}

async function getMyPurchases(buyerId) {
  const result = await pool.query(
    `SELECT bs.*, p.title, p.audio_url, p.genre_tags, p.type, u.username as seller_username
     FROM beat_sales bs
     JOIN posts p ON p.id = bs.post_id
     JOIN users u ON u.id = bs.seller_id
     WHERE bs.buyer_id = $1
     ORDER BY bs.created_at DESC`,
    [buyerId]
  );
  return result.rows;
}

async function getMySales(sellerId) {
  const result = await pool.query(
    `SELECT bs.*, p.title, p.type, u.username as buyer_username
     FROM beat_sales bs
     JOIN posts p ON p.id = bs.post_id
     JOIN users u ON u.id = bs.buyer_id
     WHERE bs.seller_id = $1
     ORDER BY bs.created_at DESC`,
    [sellerId]
  );
  return result.rows;
}

async function hasPurchased(postId, userId) {
  const result = await pool.query(
    'SELECT id FROM beat_sales WHERE post_id = $1 AND buyer_id = $2',
    [postId, userId]
  );
  return result.rows.length > 0;
}

// Backward-compatible alias
async function purchaseBeat(postId, buyerId) {
  return purchaseItem(postId, buyerId);
}

module.exports = {
  MARKETPLACE_CATEGORIES,
  purchaseItem,
  purchaseBeat,
  getMarketplace,
  getMyPurchases,
  getMySales,
  hasPurchased,
};
