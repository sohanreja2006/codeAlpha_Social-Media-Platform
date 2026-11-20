const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user.id);

    // Find all distinct chat partners from messages
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'fullName username profilePicture')
      .populate('recipient', 'fullName username profilePicture');

    const conversationMap = new Map();

    for (const msg of messages) {
      const isSender = msg.sender._id.toString() === currentUserId.toString();
      const partner = isSender ? msg.recipient : msg.sender;
      if (!partner) continue;

      const partnerId = partner._id.toString();
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          user: partner,
          lastMessage: {
            id: msg._id,
            text: msg.text,
            createdAt: msg.createdAt,
            senderId: msg.sender._id,
            isOwn: isSender,
          },
          unreadCount: 0,
        });
      }

      // Count unread if current user is recipient and not read yet
      if (!isSender && !msg.read) {
        const conv = conversationMap.get(partnerId);
        conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());

    // If fewer than 4 conversations, augment with users the current user is following
    if (conversations.length < 4) {
      const currentUser = await User.findById(currentUserId).populate(
        'following',
        'fullName username profilePicture'
      );
      if (currentUser && currentUser.following) {
        for (const followedUser of currentUser.following) {
          const fid = followedUser._id.toString();
          if (!conversationMap.has(fid) && fid !== currentUserId.toString()) {
            conversations.push({
              user: followedUser,
              lastMessage: null,
              unreadCount: 0,
            });
            conversationMap.set(fid, true);
          }
        }
      }
    }

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/chat/:userId
const getChatMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    let targetUserId = userId;
    let targetUser = null;

    if (mongoose.Types.ObjectId.isValid(userId)) {
      targetUser = await User.findById(userId).select(
        'fullName username profilePicture bio'
      );
    } else {
      targetUser = await User.findOne({ username: userId }).select(
        'fullName username profilePicture bio'
      );
      if (targetUser) targetUserId = targetUser._id.toString();
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark messages from this user to me as read
    await Message.updateMany(
      { sender: targetUserId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    // Also mark notifications of type 'message' from this user as read
    await Notification.updateMany(
      { recipient: currentUserId, sender: targetUserId, type: 'message', read: false },
      { $set: { read: true } }
    );

    // Fetch message history
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName username profilePicture')
      .populate('recipient', 'fullName username profilePicture');

    const formattedMessages = messages.map((m) => ({
      id: m._id,
      senderId: m.sender._id.toString(),
      text: m.text,
      createdAt: m.createdAt,
      read: m.read,
      isOwn: m.sender._id.toString() === currentUserId.toString(),
    }));

    res.json({
      user: targetUser,
      messages: formattedMessages,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/messages
const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Recipient and text are required' });
    }

    let targetUserId = recipientId;
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      const user = await User.findOne({ username: recipientId });
      if (!user) return res.status(404).json({ message: 'Recipient not found' });
      targetUserId = user._id.toString();
    }

    if (targetUserId.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const recipient = await User.findById(targetUserId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const message = new Message({
      sender: req.user.id,
      recipient: targetUserId,
      text: text.trim(),
    });
    await message.save();

    // Create a real notification for the recipient
    const preview =
      text.trim().length > 40 ? text.trim().substring(0, 40) + '...' : text.trim();
    await Notification.create({
      recipient: targetUserId,
      sender: req.user.id,
      type: 'message',
      text: `sent you a message: "${preview}"`,
    });

    await message.populate('sender', 'fullName username profilePicture');
    await message.populate('recipient', 'fullName username profilePicture');

    res.status(201).json({
      id: message._id,
      senderId: message.sender._id.toString(),
      recipientId: message.recipient._id.toString(),
      text: message.text,
      createdAt: message.createdAt,
      read: message.read,
      isOwn: true,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/messages/unread-count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getConversations,
  getChatMessages,
  sendMessage,
  getUnreadCount,
};

