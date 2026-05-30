const express = require('express');
const router  = express.Router();
const db      = require('../db');

// всі дані бренду одним запитом
router.get('/', async (req, res) => {
  try {
    const [info, colors, fonts, mockups, slogans] = await Promise.all([
      db.query('SELECT * FROM brand_info WHERE id = 1'),
      db.query('SELECT * FROM colors ORDER BY id'),
      db.query('SELECT * FROM fonts ORDER BY id'),
      db.query('SELECT * FROM mockups ORDER BY id'),
      db.query('SELECT * FROM slogans WHERE is_active = 1 ORDER BY id'),
    ]);
    res.json({
      info:    info.rows[0],
      colors:  colors.rows,
      fonts:   fonts.rows,
      mockups: mockups.rows,
      slogans: slogans.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// оновити основну інфу бренду
router.put('/', async (req, res) => {
  try {
    const { name, tagline, about } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    await db.query('UPDATE brand_info SET name=$1, tagline=$2, about=$3 WHERE id=1', [name, tagline, about]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
