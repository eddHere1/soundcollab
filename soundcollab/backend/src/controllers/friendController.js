const friendService = require('../services/friendService');

async function sendRequest(req, res) {
  try {
    const receiverId = parseInt(req.body.userId || req.body.receiverId);
    if (!receiverId) return res.status(400).json({ error: 'userId is required' });
    const request = await friendService.sendRequest(req.user.id, receiverId);
    res.status(201).json(request);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to send request' });
  }
}

async function acceptRequest(req, res) {
  try {
    const result = await friendService.acceptRequest(req.user.id, {
      requestId: req.body.requestId ? parseInt(req.body.requestId) : null,
      senderId: req.body.userId ? parseInt(req.body.userId) : null,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to accept request' });
  }
}

async function rejectRequest(req, res) {
  try {
    const result = await friendService.rejectRequest(req.user.id, {
      requestId: req.body.requestId ? parseInt(req.body.requestId) : null,
      senderId: req.body.userId ? parseInt(req.body.userId) : null,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to reject request' });
  }
}

async function listFriends(req, res) {
  try {
    const friends = await friendService.listFriends(req.user.id);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
}

async function listIncoming(req, res) {
  try {
    const requests = await friendService.listIncomingRequests(req.user.id);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
}

async function removeFriend(req, res) {
  try {
    const result = await friendService.removeFriend(req.user.id, parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove friend' });
  }
}

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  listFriends,
  listIncoming,
  removeFriend,
};
