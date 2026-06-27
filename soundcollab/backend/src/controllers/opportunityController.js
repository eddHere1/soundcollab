const opportunityService = require('../services/opportunityService');

async function list(req, res) {
  try {
    const items = await opportunityService.list({
      type: req.query.type,
      isPaid: req.query.isPaid,
      genre: req.query.genre,
      status: req.query.status || 'open',
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
}

async function create(req, res) {
  try {
    const { type, title, description, genre_tags, mood, is_paid, budget, tags, post_id } = req.body;
    if (!type || !title) return res.status(400).json({ error: 'Type and title are required' });

    let genres = genre_tags;
    if (typeof genres === 'string') {
      try { genres = JSON.parse(genres); } catch { genres = [genres]; }
    }
    let tagList = tags;
    if (typeof tagList === 'string') {
      try { tagList = JSON.parse(tagList); } catch { tagList = [tagList]; }
    }

    const opp = await opportunityService.create(req.user.id, {
      type, title, description,
      genre_tags: genres || [],
      mood, is_paid: is_paid === true || is_paid === 'true',
      budget: budget ? parseFloat(budget) : null,
      tags: tagList || [],
      post_id: post_id ? parseInt(post_id) : null,
    });
    res.status(201).json(opp);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to create opportunity' });
  }
}

async function getOne(req, res) {
  try {
    const opp = await opportunityService.getById(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Not found' });
    res.json(opp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
}

async function close(req, res) {
  try {
    const opp = await opportunityService.close(req.params.id, req.user.id);
    res.json(opp);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to close opportunity' });
  }
}

module.exports = { list, create, getOne, close };
