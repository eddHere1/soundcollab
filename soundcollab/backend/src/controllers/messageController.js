const messageService = require('../services/messageService');

async function sendMessage(req, res) {
  try {
    const { receiverId, content, conversationId } = req.body;
    if (!content && !req.file) return res.status(400).json({ error: 'content or attachment is required' });

    let receiver = receiverId ? parseInt(receiverId) : null;
    if (!receiver && conversationId) {
      const data = await messageService.getConversationById(parseInt(conversationId), req.user.id);
      receiver = data.other_user.id;
    }
    if (!receiver) return res.status(400).json({ error: 'receiverId or conversationId is required' });

    let attachmentUrl = null;
    let attachmentType = null;
    if (req.file) {
      attachmentUrl = `/uploads/attachments/${req.file.filename}`;
      attachmentType = req.file.mimetype?.startsWith('audio/') ? 'audio' : 'file';
    }

    const message = await messageService.sendMessage({
      senderId: req.user.id,
      receiverId: receiver,
      content: content || '',
      conversationId: conversationId ? parseInt(conversationId) : null,
      attachmentUrl,
      attachmentType,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to send message' });
  }
}

async function sendDM(req, res) {
  return sendMessage(req, res);
}

async function getConversationById(req, res) {
  try {
    const data = await messageService.getConversationById(
      parseInt(req.params.conversationId),
      req.user.id
    );
    res.json(data);
  } catch (err) {
    console.error('getConversationById error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch conversation' });
  }
}

async function getConversation(req, res) {
  try {
    const data = await messageService.getConversation(
      req.user.id,
      parseInt(req.params.userId)
    );
    res.json(data);
  } catch (err) {
    console.error('getConversation error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch conversation' });
  }
}

async function getConversations(req, res) {
  try {
    const conversations = await messageService.getConversations(req.user.id);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

async function getInbox(req, res) {
  return getConversations(req, res);
}

async function sendCollabMessage(req, res) {
  try {
    const { receiverId, content } = req.body;
    const threadId = parseInt(req.params.threadId);
    if (!receiverId || !content) {
      return res.status(400).json({ error: 'receiverId and content are required' });
    }
    const message = await messageService.sendMessage({
      senderId: req.user.id,
      receiverId: parseInt(receiverId),
      content,
      collabThreadId: threadId,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to send message' });
  }
}

async function getCollabThreadMessages(req, res) {
  try {
    const messages = await messageService.getCollabThreadMessages(
      parseInt(req.params.threadId),
      req.user.id
    );
    res.json(messages);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch messages' });
  }
}

async function getCollabThreads(req, res) {
  try {
    const threads = await messageService.getCollabThreads(req.user.id);
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch collab threads' });
  }
}

module.exports = {
  sendMessage,
  sendDM,
  getConversationById,
  getConversation,
  getConversations,
  getInbox,
  sendCollabMessage,
  getCollabThreadMessages,
  getCollabThreads,
};
