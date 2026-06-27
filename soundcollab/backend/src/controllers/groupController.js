const groupService = require('../services/groupService');

async function list(req, res) {
  try {
    const groups = await groupService.listGroups(req.user.id);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
}

async function create(req, res) {
  try {
    const { name, memberIds } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Group name is required' });
    let ids = memberIds;
    if (typeof ids === 'string') {
      try { ids = JSON.parse(ids); } catch { ids = []; }
    }
    const group = await groupService.createGroup(req.user.id, { name: name.trim(), memberIds: ids || [] });
    res.status(201).json(group);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to create group' });
  }
}

async function getMessages(req, res) {
  try {
    const data = await groupService.getGroupMessages(parseInt(req.params.id), req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch messages' });
  }
}

async function sendMessage(req, res) {
  try {
    const { content } = req.body;
    if (!content && !req.file) return res.status(400).json({ error: 'Message or attachment required' });
    let attachmentUrl = null;
    let attachmentType = null;
    if (req.file) {
      attachmentUrl = `/uploads/attachments/${req.file.filename}`;
      attachmentType = req.file.mimetype?.startsWith('audio/') ? 'audio' : 'file';
    }
    const msg = await groupService.sendGroupMessage(
      parseInt(req.params.id),
      req.user.id,
      content || '',
      attachmentUrl,
      attachmentType
    );
    res.status(201).json(msg);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to send message' });
  }
}

async function addMember(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await groupService.addMember(parseInt(req.params.id), req.user.id, parseInt(userId));
    res.json({ success: true });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to add member' });
  }
}

module.exports = { list, create, getMessages, sendMessage, addMember };
