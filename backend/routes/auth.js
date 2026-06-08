const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'reflect2025';

// генеруємо унікальний токен при кожному старті сервера
const SESSION_TOKEN = crypto.randomBytes(32).toString('hex');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const inputBuf    = Buffer.from(password || '');
  const secretBuf   = Buffer.from(ADMIN_PASSWORD);
  const match = inputBuf.length === secretBuf.length &&
                crypto.timingSafeEqual(inputBuf, secretBuf);
  if (match) {
    res.json({ token: SESSION_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// GET /api/auth/check
router.get('/check', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && token === SESSION_TOKEN) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

module.exports = router;
