const collabService = require('../services/collabService');

async function createRequest(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const attachmentUrl = req.file ? `/uploads/attachments/${req.file.filename}` : null;
    const request = await collabService.createRequest({
      postId: parseInt(req.params.postId),
      requesterId: req.user.id,
      message,
      attachmentUrl,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to create request' });
  }
}

async function getRequestsForPost(req, res) {
  try {
    const requests = await collabService.getRequestsForPost(
      parseInt(req.params.postId),
      req.user.id
    );
    res.json(requests);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch requests' });
  }
}

async function getMyRequests(req, res) {
  try {
    const requests = await collabService.getMyRequests(req.user.id);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
}

async function getIncomingRequests(req, res) {
  try {
    const requests = await collabService.getIncomingRequests(req.user.id);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incoming requests' });
  }
}

async function respondToRequest(req, res) {
  try {
    const { status } = req.body;
    const request = await collabService.respondToRequest(
      parseInt(req.params.id),
      req.user.id,
      status
    );
    res.json(request);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to respond' });
  }
}

module.exports = {
  createRequest,
  getRequestsForPost,
  getMyRequests,
  getIncomingRequests,
  respondToRequest,
};
