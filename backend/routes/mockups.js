const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const db      = require('../db');

// куди зберігати завантажені зображення
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../frontend/images'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM mockups ORDER BY id');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM mockups WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.post('/', upload.single('image'), async (req, res) => {
  const { title, category } = req.body;
  if (!title || !req.file) return res.status(400).json({ error: 'title and image are required' });
  const imagePath = 'images/' + req.file.filename;
  const { rows } = await db.query(
    'INSERT INTO mockups (title, image_path, category) VALUES ($1, $2, $3) RETURNING id',
    [title, imagePath, category]
  );
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', async (req, res) => {
  const { title, category } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const { rowCount } = await db.query(
    'UPDATE mockups SET title=$1, category=$2 WHERE id=$3',
    [title, category, req.params.id]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query('DELETE FROM mockups WHERE id=$1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
