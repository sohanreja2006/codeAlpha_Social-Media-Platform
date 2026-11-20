const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// POST /api/comments
const createComment = async (req, res, next) => {
  try {
    const { postId, content } = req.body;
    if (!postId || !content || !content.trim()) {
      return res.status(400).json({ message: 'postId and content are required' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = new Comment({
      post: postId,
      author: req.user.id,
      content: content.trim(),
    });
    await comment.save();

    post.comments.push(comment._id);
    await post.save();

    // Create notification for post author if not commenting on own post
    if (post.author.toString() !== req.user.id.toString()) {
      try {
        const preview =
          content.trim().length > 35 ? content.trim().substring(0, 35) + '...' : content.trim();
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'comment',
          post: post._id,
          comment: comment._id,
          text: `commented: "${preview}"`,
        });
      } catch (e) {
        console.error('Failed to create comment notification:', e);
      }
    }

    await comment.populate('author', 'fullName username profilePicture');
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();

    res.json({
      message: 'Comment deleted successfully',
      commentId: req.params.id,
      postId: comment.post,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createComment, deleteComment };
