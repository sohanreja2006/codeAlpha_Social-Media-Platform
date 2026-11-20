const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { checkUsername, register, login, getMe } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// GET /api/auth/check-username?username=...
router.get('/check-username', checkUsername);

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required').trim(),
    body('fullName').notEmpty().withMessage('Full name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// GET /api/auth/me
router.get('/me', auth, getMe);

module.exports = router;
