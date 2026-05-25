const express = require('express');
const router = express.Router();
const db = require('../db');

// всі слогани
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM slogans').all());
});

// додати слоган
router.post('/', (req, res) => {
  const { text, is_active } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const result = db.prepare('INSERT INTO slogans (text, is_active) VALUES (?, ?)').run(text, is_active ?? 1);
  res.status(201).json({ id: result.lastInsertRowid });
});

// оновити слоган
router.put('/:id', (req, res) => {
  const { text, is_active } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const result = db.prepare('UPDATE slogans SET text=?, is_active=? WHERE id=?').run(text, is_active, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

// видалити слоган
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM slogans WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
