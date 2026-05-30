const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM slogans ORDER BY id');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { text, is_active } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const { rows } = await db.query(
    'INSERT INTO slogans (text, is_active) VALUES ($1, $2) RETURNING id',
    [text, is_active ?? 1]
  );
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', async (req, res) => {
  const { text, is_active } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const { rowCount } = await db.query(
    'UPDATE slogans SET text=$1, is_active=$2 WHERE id=$3',
    [text, is_active, req.params.id]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM slogans WHERE id=$1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
