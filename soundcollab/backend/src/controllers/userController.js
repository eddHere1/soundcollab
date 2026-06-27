const userService = require('../services/userService');
const followService = require('../services/followService');
const friendService = require('../services/friendService');
const postService = require('../services/postService');

async function getProfile(req, res) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const counts = await followService.getFollowCounts(user.id);
    const posts = await postService.getUserPosts(user.id, req.user?.id);

    let is_following = false;
    let friendInfo = { is_friend: false, request_status: null, request_id: null };
    if (req.user && req.user.id !== user.id) {
      is_following = await followService.isFollowing(req.user.id, user.id);
      friendInfo = await friendService.getFriendStatus(req.user.id, user.id);
    }

    const isOwner = req.user && req.user.id === user.id;
    let stats = {};
    let badges = [];
    try {
      stats = await userService.getUserStats(user.id);
      badges = stats.badges || [];
      if (!isOwner) {
        const { revenue, ...publicStats } = stats;
        stats = publicStats;
      }
    } catch { /* stats optional */ }

    res.json({ ...user, ...counts, posts, is_following, ...friendInfo, stats, badges, is_owner: isOwner });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

async function updateProfile(req, res) {
  try {
    const data = {};
    if (req.body.bio !== undefined) data.bio = req.body.bio;
    if (req.body.role !== undefined) data.role = req.body.role;
    if (req.body.location !== undefined) data.location = req.body.location;
    if (req.body.genres !== undefined) {
      let genres = req.body.genres;
      if (typeof genres === 'string') {
        try { genres = JSON.parse(genres); } catch { genres = [genres]; }
      }
      data.genres = Array.isArray(genres) ? genres : [genres];
    }
    if (req.files?.profileImage?.[0]) {
      data.profile_image = `/uploads/images/${req.files.profileImage[0].filename}`;
    } else if (req.file?.fieldname === 'profileImage') {
      data.profile_image = `/uploads/images/${req.file.filename}`;
    }
    if (req.files?.bannerImage?.[0]) {
      data.banner_image = `/uploads/images/${req.files.bannerImage[0].filename}`;
    }

    const user = await userService.updateUser(req.params.id, data);
    res.json(user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to update profile' });
  }
}

async function searchUsers(req, res) {
  try {
    const users = await userService.searchUsers(req.query.q || '', {
      role: req.query.role,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
}

async function getSuggested(req, res) {
  try {
    const users = await userService.getSuggestedCreators(req.user.id);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
}

async function getStats(req, res) {
  try {
    if (!req.user || req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Stats are private' });
    }
    const stats = await userService.getUserStats(req.params.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

async function sendTip(req, res) {
  try {
    const tipService = require('../services/tipService');
    const { amount, message } = req.body;
    const tip = await tipService.sendTip(
      req.user.id,
      parseInt(req.params.id),
      parseFloat(amount),
      message
    );
    res.status(201).json(tip);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to send tip' });
  }
}

module.exports = { getProfile, updateProfile, searchUsers, getSuggested, getStats, sendTip };
