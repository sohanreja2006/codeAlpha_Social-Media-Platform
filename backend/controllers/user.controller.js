const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// GET /api/users/suggestions
const getSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).select('following');
    const following = currentUser ? currentUser.following : [];
    const excludeIds = [...following, req.user.id];

    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select('-password')
      .limit(6);

    res.json(suggestions);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:idOrUsername
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query;

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { username: id };
    }

    const user = await User.findOne(query)
      .select('-password')
      .populate('followers', 'username fullName profilePicture')
      .populate('following', 'username fullName profilePicture');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const postsCount = await Post.countDocuments({ author: user._id });
    const userObj = user.toObject();
    userObj.postsCount = postsCount;

    res.json(userObj);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, username, profilePicture, coverImage } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (username) {
      const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
      const taken = await User.findOne({
        username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') },
        _id: { $ne: req.user.id },
      });
      if (taken) {
        return res.status(400).json({
          message: 'This username is already taken. Please choose another username.',
        });
      }
      updateData.username = cleanUsername;
    }

    if (profilePicture) updateData.profilePicture = profilePicture;
    if (coverImage) updateData.coverImage = coverImage;

    if (req.files) {
      if (req.files.profilePicture && req.files.profilePicture[0]) {
        updateData.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        updateData.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true })
      .select('-password')
      .populate('followers', 'username fullName profilePicture')
      .populate('following', 'username fullName profilePicture');

    const postsCount = await Post.countDocuments({ author: user._id });
    const userObj = user.toObject();
    userObj.postsCount = postsCount;

    res.json(userObj);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/posts
const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetUserId = id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findOne({ username: id });
      if (!user) return res.status(404).json({ message: 'User not found' });
      targetUserId = user._id;
    }

    const posts = await Post.find({ author: targetUserId })
      .sort({ createdAt: -1 })
      .populate('author', '-password')
      .populate({ path: 'comments', populate: { path: 'author', select: '-password' } });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// POST /api/users/:id/follow
const followUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetUserId = id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const target = await User.findOne({ username: id });
      if (!target) return res.status(404).json({ message: 'User not found' });
      targetUserId = target._id.toString();
    }

    if (targetUserId.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.some(
      (fId) => fId.toString() === targetUserId.toString()
    );

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: req.user.id } });
      return res.json({
        message: 'Unfollowed successfully',
        following: false,
        targetUserId,
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: req.user.id } });

      // Create notification for followed user
      try {
        await Notification.create({
          recipient: targetUserId,
          sender: req.user.id,
          type: 'follow',
          text: 'started following you.',
        });
      } catch (e) {
        console.error('Failed to create follow notification:', e);
      }

      return res.json({
        message: 'Followed successfully',
        following: true,
        targetUserId,
      });
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/followers
const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { username: id };

    const user = await User.findOne(query)
      .select('followers')
      .populate('followers', '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/following
const getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { username: id };

    const user = await User.findOne(query)
      .select('following')
      .populate('following', '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/search?q=keyword
const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const currentUser = await User.findById(req.user.id).select('following');
    const regex = new RegExp(q, 'i');

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [{ username: regex }, { fullName: regex }],
    })
      .select('-password')
      .limit(20);

    const following = currentUser?.following?.map((id) => id.toString()) || [];
    const result = users.map((u) => ({
      ...u.toObject(),
      isFollowing: following.includes(u._id.toString()),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSuggestions,
  searchUsers,
  getUserProfile,
  updateProfile,
  getUserPosts,
  followUser,
  getFollowers,
  getFollowing,
};
