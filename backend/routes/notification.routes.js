const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getNotifications,
  markAllAsRead,
  markAsRead,
  getUnreadCount,
} = require('../controllers/notification.controller');

// GET /api/notifications
router.get('/', auth, getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', auth, getUnreadCount);

// PUT /api/notifications/read
router.put('/read', auth, markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, markAsRead);

module.exports = router;

