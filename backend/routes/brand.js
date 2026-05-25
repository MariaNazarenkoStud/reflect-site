const express = require('express');
const router = express.Router();
const db = require('../db');

// отримати всі дані бренду одним запитом (для публічної сторінки)
router.get('/', (req, res) => {
  const info     = db.prepare('SELECT * FROM brand_info WHERE id = 1').get();
  const colors   = db.prepare('SELECT * FROM colors').all();
  const fonts    = db.prepare('SELECT * FROM fonts').all();
  const mockups  = db.prepare('SELECT * FROM mockups').all();
  const slogans  = db.prepare('SELECT * FROM slogans WHERE is_active = 1').all();
  res.json({ info, colors, fonts, mockups, slogans });
});

// оновити основну інфу бренду
router.put('/', (req, res) => {
  const { name, tagline, about } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  db.prepare('UPDATE brand_info SET name=?, tagline=?, about=? WHERE id=1')
    .run(name, tagline, about);
  res.json({ ok: true });
});

module.exports = router;
