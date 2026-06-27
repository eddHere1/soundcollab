const postService = require('../services/postService');
const beatService = require('../services/beatService');

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

async function createPost(req, res) {
  try {
    const audioFile = req.audioFile || req.files?.audio?.[0] || (req.file?.fieldname === 'audio' ? req.file : null);
    if (!audioFile) return res.status(400).json({ error: 'Audio file is required' });

    const {
      type, title, description, genre_tags, looking_for, price,
      bpm, mood, open_verse, collab_open, marketplace_category,
    } = req.body;
    if (!type || !title) {
      return res.status(400).json({ error: 'Type and title are required' });
    }

    const coverFile = req.coverFile || req.files?.coverImage?.[0];
    const post = await postService.createPost(req.user.id, {
      type,
      title,
      audio_url: `/uploads/audio/${audioFile.filename}`,
      cover_image: coverFile ? `/uploads/images/${coverFile.filename}` : null,
      description,
      genre_tags: parseArrayField(genre_tags),
      looking_for: parseArrayField(looking_for),
      price: price ? parseFloat(price) : null,
      bpm: bpm ? parseInt(bpm) : null,
      mood: mood || null,
      open_verse: open_verse === true || open_verse === 'true',
      collab_open: collab_open === true || collab_open === 'true',
      marketplace_category: marketplace_category || null,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
}

async function getFeed(req, res) {
  try {
    const posts = await postService.getFeed({
      type: req.query.type,
      genre: req.query.genre,
      mood: req.query.mood,
      lookingFor: req.query.lookingFor,
      followingOnly: req.query.following === 'true',
      role: req.query.role,
      userId: req.user?.id,
      sort: req.query.sort || 'newest',
      q: req.query.q,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
}

async function getPost(req, res) {
  try {
    const post = await postService.getPostById(req.params.id, req.user?.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    let owned = false;
    if (req.user && post.price) {
      owned = await beatService.hasPurchased(post.id, req.user.id);
    }

    res.json({ ...post, owned });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}

async function toggleLike(req, res) {
  try {
    const result = await postService.toggleLike(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
}

async function addComment(req, res) {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const comment = await postService.addComment(req.params.id, req.user.id, content);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

async function getComments(req, res) {
  try {
    const comments = await postService.getComments(req.params.id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

async function deletePost(req, res) {
  try {
    await postService.deletePost(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to delete post' });
  }
}

async function updatePost(req, res) {
  try {
    const data = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.type !== undefined) data.type = req.body.type;
    if (req.body.genre_tags !== undefined) data.genre_tags = parseArrayField(req.body.genre_tags);
    if (req.body.looking_for !== undefined) data.looking_for = parseArrayField(req.body.looking_for);
    if (req.body.price !== undefined) {
      data.price = req.body.price === '' || req.body.price === null ? null : parseFloat(req.body.price);
    }
    if (req.body.bpm !== undefined) data.bpm = req.body.bpm ? parseInt(req.body.bpm) : null;
    if (req.body.mood !== undefined) data.mood = req.body.mood || null;
    if (req.body.open_verse !== undefined) {
      data.open_verse = req.body.open_verse === true || req.body.open_verse === 'true';
    }
    if (req.body.collab_open !== undefined) {
      data.collab_open = req.body.collab_open === true || req.body.collab_open === 'true';
    }
    if (req.body.marketplace_category !== undefined) {
      data.marketplace_category = req.body.marketplace_category || null;
    }
    const audioFile = req.audioFile || req.files?.audio?.[0] || (req.file?.fieldname === 'audio' ? req.file : null);
    const coverFile = req.coverFile || req.files?.coverImage?.[0];
    if (audioFile) data.audio_url = `/uploads/audio/${audioFile.filename}`;
    if (coverFile) data.cover_image = `/uploads/images/${coverFile.filename}`;

    const post = await postService.updatePost(req.params.id, req.user.id, data);
    res.json(post);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to update post' });
  }
}

async function toggleSave(req, res) {
  try {
    const result = await postService.toggleSave(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save' });
  }
}

async function getSaved(req, res) {
  try {
    const posts = await postService.getSavedPosts(req.user.id);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
}

async function getLiked(req, res) {
  try {
    const posts = await postService.getLikedPosts(req.user.id);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch liked posts' });
  }
}

async function getRecent(req, res) {
  try {
    const posts = await postService.getRecentlyPlayed(req.user.id);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recently played' });
  }
}

async function recordPlay(req, res) {
  try {
    await postService.recordPlay(req.user.id, parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record play' });
  }
}

module.exports = {
  createPost,
  getFeed,
  getPost,
  updatePost,
  toggleLike,
  toggleSave,
  addComment,
  getComments,
  deletePost,
  getSaved,
  getLiked,
  getRecent,
  recordPlay,
};
