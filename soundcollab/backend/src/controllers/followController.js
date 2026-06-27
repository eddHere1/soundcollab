const followService = require('../services/followService');

async function follow(req, res) {
  try {
    const result = await followService.follow(req.user.id, parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to follow' });
  }
}

async function unfollow(req, res) {
  try {
    const result = await followService.unfollow(req.user.id, parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to unfollow' });
  }
}

async function getFollowers(req, res) {
  try {
    const followers = await followService.getFollowers(parseInt(req.params.id));
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
}

async function getFollowing(req, res) {
  try {
    const following = await followService.getFollowing(parseInt(req.params.id));
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following' });
  }
}

module.exports = { follow, unfollow, getFollowers, getFollowing };
