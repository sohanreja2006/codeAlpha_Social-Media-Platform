const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/posts/feed
const getFeed = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id).select('following');
    const following = currentUser ? currentUser.following : [];
    const feedUserIds = [...following, req.user.id];

    let posts = await Post.find({ author: { $in: feedUserIds } })
      .sort({ createdAt: -1 })
      .populate('author', '-password')
      .populate({ path: 'comments', populate: { path: 'author', select: '-password' } });

    // If user has no feed posts yet, fall back to recent community posts
    if (posts.length === 0) {
      posts = await Post.find({})
        .sort({ createdAt: -1 })
        .limit(30)
        .populate('author', '-password')
        .populate({ path: 'comments', populate: { path: 'author', select: '-password' } });
    }

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/explore
const getExplorePosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('author', '-password')
      .populate({ path: 'comments', populate: { path: 'author', select: '-password' } });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;
    if (!content && !req.file && !image) {
      return res.status(400).json({ message: 'Content or image is required' });
    }

    const postData = { author: req.user.id, content: content || '' };
    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`;
    } else if (image) {
      postData.image = image;
    }

    const post = new Post(postData);
    await post.save();
    await post.populate('author', '-password');

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Comment.deleteMany({ _id: { $in: post.comments } });
    await post.deleteOne();

    res.json({ message: 'Post deleted successfully', postId: req.params.id });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.some((id) => id.toString() === req.user.id);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);

      // Create notification for post author if not liking own post
      if (post.author.toString() !== req.user.id.toString()) {
        try {
          await Notification.create({
            recipient: post.author,
            sender: req.user.id,
            type: 'like',
            post: post._id,
            text: 'liked your post.',
          });
        } catch (e) {
          console.error('Failed to create like notification:', e);
        }
      }
    }

    await post.save();
    res.json({ liked: !isLiked, likesCount: post.likes.length, likes: post.likes });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id/comments
const getPostComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate('author', '-password');

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

module.exports = { getFeed, getExplorePosts, createPost, deletePost, toggleLike, getPostComments };
