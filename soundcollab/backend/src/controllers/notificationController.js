const notificationService = require('../services/notificationService');

async function list(req, res) {
  try {
    const notifications = await notificationService.list(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

async function unreadCount(req, res) {
  try {
    const count = await notificationService.unreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch count' });
  }
}

async function markRead(req, res) {
  try {
    const notification = await notificationService.markRead(parseInt(req.params.id), req.user.id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark read' });
  }
}

async function markAllRead(req, res) {
  try {
    await notificationService.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all read' });
  }
}

module.exports = { list, unreadCount, markRead, markAllRead };
