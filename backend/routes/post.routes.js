const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getFeed,
  getExplorePosts,
  createPost,
  deletePost,
  toggleLike,
  getPostComments,
} = require('../controllers/post.controller');

// GET /api/posts/feed
router.get('/feed', auth, getFeed);

// GET /api/posts/explore
router.get('/explore', auth, getExplorePosts);

// POST /api/posts
router.post('/', auth, upload.single('image'), createPost);

// DELETE /api/posts/:id
router.delete('/:id', auth, deletePost);

// POST /api/posts/:id/like
router.post('/:id/like', auth, toggleLike);

// GET /api/posts/:id/comments
router.get('/:id/comments', auth, getPostComments);

module.exports = router;
