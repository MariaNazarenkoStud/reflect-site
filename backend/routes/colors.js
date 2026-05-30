const express = require('express');
const router  = express.Router();
const db      = require('../db');

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM colors ORDER BY id');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM colors WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { name, hex, label } = req.body;
  if (!name || !hex) return res.status(400).json({ error: 'name and hex are required' });
  const { rows } = await db.query(
    'INSERT INTO colors (name, hex, label) VALUES ($1, $2, $3) RETURNING id',
    [name, hex, label]
  );
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', async (req, res) => {
  const { name, hex, label } = req.body;
  if (!name || !hex) return res.status(400).json({ error: 'name and hex are required' });
  const { rowCount } = await db.query(
    'UPDATE colors SET name=$1, hex=$2, label=$3 WHERE id=$4',
    [name, hex, label, req.params.id]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM colors WHERE id=$1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
