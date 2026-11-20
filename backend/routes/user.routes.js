const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getSuggestions,
  searchUsers,
  getUserProfile,
  updateProfile,
  getUserPosts,
  followUser,
  getFollowers,
  getFollowing,
} = require('../controllers/user.controller');

// GET /api/users/suggestions
router.get('/suggestions', auth, getSuggestions);

// GET /api/users/search?q=keyword  — must be before /:id
router.get('/search', auth, searchUsers);

// PUT /api/users/profile
router.put(
  '/profile',
  auth,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  updateProfile
);

// GET /api/users/:id
router.get('/:id', auth, getUserProfile);

// GET /api/users/:id/posts
router.get('/:id/posts', auth, getUserPosts);

// POST /api/users/:id/follow
router.post('/:id/follow', auth, followUser);

// GET /api/users/:id/followers
router.get('/:id/followers', auth, getFollowers);

// GET /api/users/:id/following
router.get('/:id/following', auth, getFollowing);

module.exports = router;
