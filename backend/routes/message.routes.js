const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getConversations,
  getChatMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/message.controller');

// GET /api/messages/conversations
router.get('/conversations', auth, getConversations);

// GET /api/messages/unread-count
router.get('/unread-count', auth, getUnreadCount);

// GET /api/messages/chat/:userId
router.get('/chat/:userId', auth, getChatMessages);

// POST /api/messages
router.post('/', auth, sendMessage);

module.exports = router;

