const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createComment, deleteComment } = require('../controllers/comment.controller');

// POST /api/comments
router.post('/', auth, createComment);

// DELETE /api/comments/:id
router.delete('/:id', auth, deleteComment);

module.exports = router;
