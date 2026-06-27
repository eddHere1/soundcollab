const playlistService = require('../services/playlistService');

async function list(req, res) {
  try {
    const playlists = await playlistService.getUserPlaylists(req.user.id);
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
}

async function getOne(req, res) {
  try {
    const playlist = await playlistService.getPlaylist(req.params.id, req.user?.id);
    res.json(playlist);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch playlist' });
  }
}

async function create(req, res) {
  try {
    const { name, description, is_public } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const playlist = await playlistService.create(req.user.id, { name, description, is_public });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
}

async function addItem(req, res) {
  try {
    const playlist = await playlistService.addItem(
      req.params.id, req.user.id, parseInt(req.body.postId)
    );
    res.json(playlist);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to add item' });
  }
}

async function removeItem(req, res) {
  try {
    const playlist = await playlistService.removeItem(
      req.params.id, req.user.id, parseInt(req.params.postId)
    );
    res.json(playlist);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to remove item' });
  }
}

module.exports = { list, getOne, create, addItem, removeItem };
