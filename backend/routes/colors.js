const express = require('express');
const router = express.Router();
const db = require('../db');

// усі кольори
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM colors').all());
});

// один колір
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM colors WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

// додати колір
router.post('/', (req, res) => {
  const { name, hex, label } = req.body;
  if (!name || !hex) return res.status(400).json({ error: 'name and hex are required' });
  const result = db.prepare('INSERT INTO colors (name, hex, label) VALUES (?, ?, ?)').run(name, hex, label);
  res.status(201).json({ id: result.lastInsertRowid });
});

// оновити колір
router.put('/:id', (req, res) => {
  const { name, hex, label } = req.body;
  if (!name || !hex) return res.status(400).json({ error: 'name and hex are required' });
  const result = db.prepare('UPDATE colors SET name=?, hex=?, label=? WHERE id=?').run(name, hex, label, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

// видалити колір
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM colors WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
